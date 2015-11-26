library("opadar")
library("dplyr")
datapath <- c("./data/", "~/OPADA/Transparencia/indicadores-para-web/saiku-exports/",
              "~/OPADA/Transparencia/indicadores-para-web/data/",
              "~/OPADA/data/SIIU/ficheros-codigos/")
load(datafile("alumnos.Rdata"))
## el directorio donde se guardarán los ficheros con información sobre nodos etc...
datadir <- "../data/students/"
## -----------------------------------------------------------------------------
##
## We add columns that indicate the level of hierarchy and will determine the
## nodes ids
##
## -----------------------------------------------------------------------------
alumnos <- alumnos %>%
  mutate(nivel1 = Universidad,
         nivel2 = paste(nivel1, CENTRO_ACRONIMO, sep = "/"),
         nivel3 = paste(nivel2, SUBTIPO_ESTUDIO_ID, sep = "/"),
         nivel4 = paste(nivel3, PLAN_ID, sep = "/"))
incoming <- incoming %>%
  mutate(nivel1 = Universidad,
         nivel2 = paste(nivel1, "INCOMING", sep = "/"))
doct.ep <- doct.ep %>%
  mutate(nivel1 = Universidad,
         nivel2 = paste(nivel1, CENTRO_ACRONIMO, sep = "/"))


## -----------------------------------------------------------------------------
##
## We create the file with nodes information (labels, color, etc..)
##
## -----------------------------------------------------------------------------

nodes_info <- data.frame(id = "064",
                         labelSpanish = "UPCT",
                         labelEnglish = "UPCT",
                         color = "rgb(63, 127, 205)",
                         fullNameSpanish =
                           "Universidad Politécnica de Cartagena",
                         fullNameEnglish = "Technical University of Cartagena")
nodes_centros <- with(alumnos, data.frame(id = nivel2,
                                          labelSpanish = CENTRO_ACRONIMO,
                                          labelEnglish = CENTRO_ACRONIMO,
                                          color = "rgb(63, 127, 205)",
                                          fullNameSpanish = CENTRO_DESC,
                                          fullNameEnglish = CENTRO_DESC) %>%
                                 distinct)
nodes_tipo <-
  with(alumnos,
       data.frame(id = nivel3,
                  labelSpanish = Tipo,
                  labelEnglish = plyr::mapvalues(Tipo,
                                                 from =
                                                   c("Grado",
                                                     "Primer y segundo ciclo",
                                                     "Máster"),
                                                 to =
                                                   c("Bachelor",
                                                     "Pre-EHEA programmes",
                                                     "Master")))) %>%
  mutate(color = "rgb(63, 127, 205)",
         fullNameSpanish = labelSpanish,
         fullNameEnglish = labelEnglish) %>%
                                 distinct
## -----------------------------------------------------------------------------
## Para los nodos de planes, cargamos los acrónimos desde un excel
## labels.wb <-
##   openxlsx::loadWorkbook(datafile("labels.xlsx") )
labels <- read.csv(datafile("labels.csv"),
                   header = TRUE, colClasses = "character")
## We check that all programmes of `alumnos` are in `planes`.
if (sum(!alumnos$PLAN_ID %in% labels$PLAN_ID) >0){
  stop("Alguna titulacion de alumnos no está en planes")
}
alumnos <- alumnos %>%
  left_join(labels)
nodes_planes <- with(alumnos %>%
                    filter(Tipo != "Primer y segundo ciclo"),
                    data.frame(id = nivel4,
                               labelSpanish = labelSpanish,
                               fullNameSpanish = PLAN_DESC)) %>%
  mutate(color = "rgb(63, 127, 205)",
         labelEnglish = labelSpanish,
         fullNameEnglish = fullNameSpanish) %>%
  distinct
## ---------------------------------------------------------------------------
##
## Añadimos aquí alumnos internacionales, títulos propios y doctorados
##
## ----------------------------------------------------------------------------
nodes_centros <- rbind(nodes_centros,
                       with(incoming,
                            data.frame(id = nivel2,
                                       labelSpanish = "Internacionales",
                                       labelEnglish = "Incoming Students",
                                       color = "rgb(63, 127, 205)",
                                       fullNameSpanish =
                                         "Estudiantes de movilidad internacional dentro de convenios",
                                       fullNameEnglish =
                                         "Incoming international students") %>%
                              distinct),
                       with(doct.ep,
                            data.frame(id = nivel2,
                                       labelSpanish = labelSpanish,
                                       labelEnglish = labelSpanish,
                                       color = "rgb(63, 127, 205)",
                                       fullNameSpanish = fullNameSpanish,
                                       fullNameEnglish = fullNameSpanish) %>%
                              distinct))
nodes_info <-
  rbind(nodes_info,
        nodes_centros,
        nodes_tipo,
        nodes_planes)
write.csv(nodes_info, paste0(datadir, "nodes_info.csv"),
          row.names = FALSE)
## -----------------------------------------------------------------------------
##
## To create the links
##
## -----------------------------------------------------------------------------
links_12<- alumnos %>%
  select(nivel1, nivel2) %>%
  distinct
links_12 <- rbind(links_12,
                  incoming %>%
                    select(nivel1, nivel2) %>%
                    distinct,
                  doct.ep %>%
                    select(nivel1, nivel2) %>%
                    distinct)
names(links_12) <- c("source", "target")
links_23 <- alumnos %>%
  select(nivel2, nivel3) %>%
  distinct
names(links_23) <- c("source", "target")
links_34 <- alumnos %>%
  filter(Tipo != "Primer y segundo ciclo") %>%
  select(nivel3, nivel4) %>%
  distinct
names(links_34) <- c("source", "target")
links <- rbind(links_12, links_23, links_34)
write.csv(links, paste0(datadir,"links.csv"),
          row.names = FALSE)
## -----------------------------------------------------------------------------
##
## To compute the number of students, gender distribution, etc..
##
## -----------------------------------------------------------------------------
indicators <- function(alumnos, groupvariable){
  # Convert character vector to list of symbols
  dots <- lapply(groupvariable, as.symbol)
  indicadores <- alumnos %>%
    group_by_(.dots = dots) %>%
    summarise(students = n(),
              maleproportion = round(sum(Sexo == "Hombre") / students * 100)) %>%
    ungroup
  names(indicadores)[1] <- "node_id"
  indicadores %>%
    tidyr::gather(key = "indicator",
                  value = "value",
                  - node_id) %>%
    mutate(indicator = as.character(indicator))
}
## Para los niveles 1 y 2, consideramos alumnos y incoming (y títulos propios y
## doctorandos)

datosnivel12 <- rbind(alumnos %>% select(nivel1, nivel2, Sexo),
                      incoming %>% select(nivel1, nivel2, Sexo),
                      doct.ep %>% select(nivel1, nivel2, Sexo))
## generamos los números de de los nodos.
nodes_figures <-
  rbind(indicators(datosnivel12, "nivel1"),
        indicators(datosnivel12, "nivel2"),
        indicators(alumnos, "nivel3"),
        indicators(alumnos, "nivel4")) %>%
  arrange(node_id, desc(indicator))
nodes_figures$year <- "2013-14"

load("results/indicators_tables.Rdata")
nodes_figures <- rbind(nodes_figures,
                       indicators_tables)
write.csv(nodes_figures, file = paste0(datadir, "nodes_figures.csv"),
          row.names = FALSE)
