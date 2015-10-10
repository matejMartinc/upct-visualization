library("opadar")
library("dplyr")
datapath <- c("./data/")
load(datafile("alumnos.Rdata"))
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
nodes_info <- data.frame(id = "064",
                         labelSpanish = "UPCT",
                         labelEnglish = "UPCT",
                         color = "#009933",
                         fullNameSpanish =
                           "Universidad Politécnica de Cartagena",
                         fullNameEnglish = "Technical University of Cartagena")
nodes_centros <- with(alumnos, data.frame(id = nivel2,
                                          labelSpanish = CENTRO_ACRONIMO,
                                          labelEnglish = CENTRO_ACRONIMO,
                                          color = "#009933",
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
  mutate(color = "#009933",
         fullNameSpanish = labelSpanish,
         fullNameEnglish = labelEnglish) %>%
                                 distinct

nodes_planes <- with(alumnos,
       data.frame(id = nivel4,
                  labelSpanish = ifelse(PLAN_ACRONIMO == "",
                                        PLAN_DESC,
                                        PLAN_ACRONIMO),
                  fullNameSpanish = PLAN_DESC)) %>%
  mutate(color = "#009933",
         labelEnglish = labelSpanish,
         fullNameEnglish = fullNameSpanish) %>%
                                 distinct
nodes_info <-
  rbind(nodes_info,
        nodes_centros,
        nodes_tipo,
        nodes_planes)
write.csv(nodes_info, "../data/nodes_info.csv",
          row.names = FALSE)
