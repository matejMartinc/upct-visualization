library("opadar")
library("dplyr")
datapath <- c("./data/", 
              "~/OPADA/data/SIIU/ficheros-codigos/")
load(datafile("staff.Rdata"))
## el directorio donde se guardarán los ficheros con información sobre nodos etc...
datadir <- "../data/people/"
## -----------------------------------------------------------------------------
##
## We add columns that indicate the level of hierarchy and will determine the
## nodes ids
##
## -----------------------------------------------------------------------------
pdi <- informe.pdi %>%
  mutate(nivel1 = "064",
         nivel2 = paste(nivel1, "PDI", sep = "/"),
         nivel3 = paste(nivel2, Tipo, sep = "/"),
         nivel4 = paste(nivel3, CategoriaCuerpoEscala, sep = "/"))

pas.funcionario <- informe.pas %>%
  filter(TipoPersonal_DESC == "Funcionario") %>%
  mutate(nivel1 = "064",
         nivel2 = paste(nivel1, "PAS", sep = "/"),
         nivel3 = paste(nivel2,  "F", sep = "/"),
         ## Si son interinos o de carreras:
         nivel4 = paste(nivel3, ID_TIPO_REGIMEN_JURIDICO, sep = "/"),
         ## según su grupo:
         nivel5 = paste(nivel4, CuerpoEscalaPAS, sep = "/"))
pas.laboral <- informe.pas %>%
  filter(TipoPersonal_DESC == "Laboral",
         ID_TIPO_REGIMEN_JURIDICO != "LI") %>%
  mutate(nivel1 = "064",
         nivel2 = paste(nivel1, "PAS", sep = "/"),
         nivel3 = paste(nivel1, "L",sep = "/"))
pas.idi <- informe.pas %>%
  filter(ID_TIPO_REGIMEN_JURIDICO == "LI") %>%
  mutate(nivel1 = "064",
         nivel2 = paste(nivel1, "PAS", sep = "/"),
         nivel3 = paste(nivel2, "LI",sep = "/"))
## -----------------------------------------------------------------------------
##
## We create the file with nodes information (labels, color, etc..)
##
## -----------------------------------------------------------------------------

nodes_info <- data.frame(id = "064",
                         labelSpanish = "Personal",
                         labelEnglish = "Personal",
                         color = "rgb(205, 63, 63)",
                         fullNameSpanish =
                           "Personal",
                         fullNameEnglish = "Personal")
nodes_nivel2 <- with(pdi, data.frame(id = nivel2,
                                     labelSpanish = "PDI",
                                     labelEnglish = "PDI",
                                     color = "rgb(205, 63, 63)",
                                     fullNameSpanish =
                                       "Personal Docente e Investigador",
                                     fullNameEnglish =
                                       "Personal Docente e Investigador") %>%
                            distinct)

nodes_nivel3 <- with(pdi, data.frame(id = nivel3,
                                     labelSpanish = Tipo,
                                          labelEnglish = Tipo,
                                          color = "rgb(205, 63, 63)",
                                          fullNameSpanish = Tipo,
                                          fullNameEnglish = Tipo) %>%
                                 distinct)

nodes_nivel4 <- with(pdi, data.frame(id = nivel4,
                                     labelSpanish = CategoriaCuerpoEscala_DESC,
                                          labelEnglish = CategoriaCuerpoEscala_DESC,
                                          color = "rgb(205, 63, 63)",
                                          fullNameSpanish = CategoriaCuerpoEscala_DESC,
                                          fullNameEnglish = CategoriaCuerpoEscala_DESC) %>%
                            distinct)

## ---------------------------------------------------------------------------
##
## Añadimos aquí PAS
##
## ----------------------------------------------------------------------------
nodes_nivel2 <-
  rbind(nodes_nivel2,
        with(rbind(pas.funcionario %>%
                     select(- matches("nivel[4-5]")),
                   pas.laboral,
                   pas.idi),
             data.frame(id = nivel2,
                        labelSpanish = "PAS",
                        labelEnglish = "PAS",
                        color = "rgb(205, 63, 63)",
                        fullNameSpanish =
                          "Personal de Admnistración y Servicios",
                        fullNameEnglish =
                          "Personal de Administración y Servicios") %>%
               distinct))
nodes_nivel3 <-
  rbind(nodes_nivel3,
        with(pas.funcionario, data.frame(id = nivel3,
                                         labelSpanish = "Funcionario",
                                         labelEnglish = "Funcionario",
                                         color = "rgb(205, 63, 63)",
                                         fullNameSpanish = "Funcionario",
                                         fullNameEnglish = "Funcionario") %>%
                                distinct))

nodes_nivel4 <-
  rbind(nodes_nivel4,
        with(pas.funcionario, data.frame(id = nivel4,
                                         labelSpanish = TipoFuncionario,
                                         labelEnglish = TipoFuncionario,
                                         color = "rgb(205, 63, 63)",
                                         fullNameSpanish = TipoFuncionario,
                                         fullNameEnglish = TipoFuncionario) %>%
                                distinct))
nodes_nivel5 <-
  with(pas.funcionario, data.frame(id = nivel5,
                                   labelSpanish = CuerpoEscalaPAS_DESC,
                                   labelEnglish = CuerpoEscalaPAS_DESC,
                                   color = "rgb(205, 63, 63)",
                                   fullNameSpanish = CuerpoEscalaPAS_DESC,
                                   fullNameEnglish = CuerpoEscalaPAS_DESC) %>%
                          distinct)
## PAS LABORAL
nodes_nivel3 <-rbind(nodes_nivel3,
                     with(pas.laboral, data.frame(id = nivel3,
                                                  labelSpanish = "Laboral",
                                                  labelEnglish = "Laboral",
                                                  color = "rgb(205, 63, 63)",
                                                  fullNameSpanish = "Laboral",
                                                  fullNameEnglish = "Laboral") %>%
                                         distinct),
                     with(pas.idi, data.frame(id = nivel3,
                                              labelSpanish = "Contratados I+D+I",
                                              labelEnglish = "Contratatos I+D+I",
                                              color = "rgb(205, 63, 63)",
                                              fullNameSpanish =
                                     "Contratados con cargo a actividades de I+D+I",
                                              fullNameEnglish = "Contratados con cargo a actividades de I+D+I") %>%
                                     distinct))


nodes_info <-
  rbind(nodes_info,
        nodes_nivel2,
        nodes_nivel3,
        nodes_nivel4,
        nodes_nivel5)

write.csv(nodes_info, paste0(datadir, "nodes_info.csv"),
          row.names = FALSE)
## -----------------------------------------------------------------------------
##
## To create the links
##
## -----------------------------------------------------------------------------
links_12<- pdi %>%
  select(nivel1, nivel2) %>%
  distinct
links_12 <- rbind(links_12,
                  pas.funcionario %>%
                    select(nivel1, nivel2) %>%
                    distinct,
                  pas.laboral %>%
                    select(nivel1, nivel2) %>%
                    distinct,
                  pas.idi %>%
                    select(nivel1, nivel2) %>%
                    distinct)
names(links_12) <- c("source", "target")
links_23 <- pdi %>%
  select(nivel2, nivel3) %>%
  distinct
links_23 <- rbind(links_23,
                  pas.funcionario %>%
                    select(nivel2, nivel3) %>%
                    distinct,
                  pas.laboral %>%
                    select(nivel2, nivel3) %>%
                    distinct,
                  pas.idi %>%
                    select(nivel2, nivel3) %>%
                    distinct)
names(links_23) <- c("source", "target")

links_34 <- pdi %>%
  select(nivel3, nivel4) %>%
  distinct
links_34 <- rbind(links_34,
                  pas.funcionario %>%
                    select(nivel3, nivel4) %>%
                    distinct)
names(links_34) <- c("source", "target")
links_45 <- pas.funcionario %>%
  select(nivel4, nivel5) %>%
  distinct
names(links_45) <- c("source", "target")

links <- rbind(links_12, links_23, links_34, links_45)
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
## Para los niveles 1, 2 y 3, consideramos pdi, pas.funcionario, pas.laboral y
## pas.idi 

datosnivel123 <- rbind(pdi %>% select(nivel1, nivel2, nivel3, Sexo),
                      pas.funcionario %>% select(nivel1, nivel2, nivel3, Sexo),
                      pas.laboral %>% select(nivel1, nivel2, nivel3, Sexo),
                      pas.idi %>% select(nivel1, nivel2, nivel3, Sexo))
datosnivel4 <- rbind(pdi %>% select(nivel4, Sexo),
                      pas.funcionario %>% select(nivel4, Sexo))
## generamos los números de de los nodos.
nodes_figures <-
  rbind(indicators(datosnivel123, "nivel1"),
        indicators(datosnivel123, "nivel2"),
        indicators(datosnivel123, "nivel3"),
        indicators(datosnivel4, "nivel4"),
        indicators(pas.funcionario, "nivel5")) %>%
  arrange(node_id, desc(indicator))
nodes_figures$year <- "2014-15"
write.csv(nodes_figures, file = paste0(datadir, "nodes_figures.csv"),
          row.names = FALSE)
