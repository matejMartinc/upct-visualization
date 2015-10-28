library("dplyr")
library("opadar")
datapath <- c("./data/", "~/OPADA/Transparencia/indicadores-para-web/saiku-exports/",
              "~/OPADA/Transparencia/indicadores-para-web/data/",
              "~/OPADA/data/SIIU/ficheros-codigos/")

## -----------------------------------------------------------------------------
##
## Add graduation rate, dropout rate, etc.. Obtenemos estos datos a partir de
## los cubos de explotación, exportando los resultados a csv.
##
## -----------------------------------------------------------------------------
##
## Rescatamos los planescentros para poder usar centro acrónimo etc..
planescentros <-
  read.table(datafile("planes_centros-fecharef-02-02-2015.txt"),
             sep = "|",  fileEncoding = "latin1",
             header = TRUE) %>%
  filter(!grepl("[A-Z]", PLAN_ID, ignore.case = TRUE)) %>%
  select(CENTRO_ACRONIMO, SUBTIPO_ESTUDIO_ID, PLAN_ID, PLAN_DESC)
## ----------------------------------------------------------------------------
##
## Cargamos los indicadores exportados de las consultas SAIKU
##
## ----------------------------------------------------------------------------
eficiencia.cohorte.egreso <-
  read.table(datafile('saiku-export-eficiencia-grado-master.csv'),
             sep = ",", header = TRUE, quote = "'\"")
eficiencia.cohorte.egreso <-
  eficiencia.cohorte.egreso %>%
  left_join(planescentros,
           by = c("PLAN.EXPEDIENTE" = "PLAN_DESC"))

creditosanyanyaca <-
  read.table(datafile('ok-saiku-export-creditos-matriculados-aprobados-grado-master.csv'),
             sep = ",",
             header = TRUE,
             quote = "'\"")
creditosanyanyaca <- creditosanyanyaca %>%
  left_join(planescentros,
            by = c("PLAN.ASIGNATURA" =  "PLAN_DESC"))
## problema con grado en ingeniería industrial CUD, no tiene misma denominación...
indicadores.cohorte.inicio <-
  read.table(datafile('ok-saiku-export-abandono-graduacion-estudiantes-poblacion-objetivo-que-inician-grado-master.csv'),
             sep = ",",
             header = TRUE,
             quote = "'\"") %>%
  rename(Estudiantes.poblacion.objetivo = Estudiantes.que.inician.los.estudios)

alumnos.que.inician <-
  read.table(datafile('ok-saiku-export-estudiantes-que-inician-grado-master.csv'),
             sep=",",
             header=TRUE,
             quote = "'\"")
indicadores.cohorte.inicio <-
  merge(indicadores.cohorte.inicio,
        alumnos.que.inician %>%
          select(AÑO.DE.INICIO,
                 PLAN.EXPEDIENTE,
                 Estudiantes.que.inician.los.estudios),
        by=c("AÑO.DE.INICIO","PLAN.EXPEDIENTE"))
indicadores.cohorte.inicio <- indicadores.cohorte.inicio %>%
  left_join(planescentros, by = c("PLAN.EXPEDIENTE" = "PLAN_DESC"))
## ----------------------------------------------------------------------------
##
## Lo ponemos en forma correcta con los nodos
##
## ----------------------------------------------------------------------------
construirnodosindicadores <- function(dataframe, varaño, indicadores){
  nodes <- data.frame(node_id = with(dataframe,
                                     paste("064", CENTRO_ACRONIMO,
                                           SUBTIPO_ESTUDIO_ID, PLAN_ID, sep =
                                                                          "/")),
                      year = get(varaño, dataframe))
  nodes[indicadores] <- dataframe[indicadores]
  nodes %>%
    tidyr::gather(indicator, value, -node_id, -year) %>%
    mutate(indicator = as.character(indicator))
}
## -----------------------------------------------------------------------------
## Los indicadores de inicio, aquí podríamos especificar abandono, añadiendo al
## argumento indicadores
inicio <- construirnodosindicadores(dataframe = indicadores.cohorte.inicio %>%
                                  rename(newstudents =
                                        Estudiantes.que.inician.los.estudios,
                                      graduationrate = TASA.GRADUACION.EN.T.o.T.1),
                               varaño = "AÑO.DE.INICIO",
                               indicadores =  c("newstudents",
                                                "graduationrate"))
## ----------------------------------------------------------------------------
## Tasa de eficiencia
eficiencia <- construirnodosindicadores(dataframe = eficiencia.cohorte.egreso %>%
                              rename(efficiencyrate = TASA.EFICIENCIA),
                            varaño = "AÑO.DE.EGRESO",
                            indicadores = "efficiencyrate")
## ----------------------------------------------------------------------------
## Tasa de rendimiento
rendimiento <- construirnodosindicadores(dataframe = creditosanyanyaca %>%
                                           mutate(performancerate =
                                                    Creds..Aprobados /
                                                    Creds..Matriculados),
                                         varaño = "AÑO.ACADEMICO",
                                         indicadores = "performancerate")
## ---------------------------------------------------------------------------
## Las juntamos
indicators <- rbind(inicio, eficiencia, rendimiento)

## ----------------------------------------------------------------------------
##
## Para los grados, deben aparecer los años desde 2008-09 hasta 2013-14,
## mientras que para los másteres deben aparecer los años desde 2010-11 hasta
## 2013-14
##
## ----------------------------------------------------------------------------
añosgrado <- paste(2008:2013, formatC(9:14, width = 2, flag = "0"), sep = "-")
añosmaster <- paste(2010:2013, formatC(11:14, width = 2, flag = "0"), sep = "-")
combinacionesgrado <-
  expand.grid((indicators %>%
                 filter(grepl("/GRA/", node_id)))$node_id %>%
                                                  unique(),
              añosgrado,
              unique(indicators$indicator),
              stringsAsFactors = FALSE)
combinacionesmaster <-
  expand.grid((indicators %>%
                 filter(grepl("/MOF/", node_id)))$node_id %>%
                                                  unique(),
              añosmaster,
              unique(indicators$indicator),
              stringsAsFactors = FALSE)
combinaciones <- rbind(combinacionesgrado, combinacionesmaster)
names(combinaciones) <- c("node_id", "year", "indicator") 
indicators <- combinaciones %>%
  left_join(indicators) %>%
  mutate(value = cambiaNA(ifelse(grepl("rate", indicator),
                                 ifelse(!is.na(value),
                                        paste(round(value * 100), "%", sep = ""),
                                        value),
                                 value),
                          "-"))
indicators_tables <- indicators
save(indicators_tables, file  =  "results/indicators_tables.Rdata")
