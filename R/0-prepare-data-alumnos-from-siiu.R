## -----------------------------------------------------------------------------
##
## Prepare
##
## -----------------------------------------------------------------------------
##
library("opadar")
library("dplyr")
library("XML")
datapath <- c("~/OPADA/data/SIIU/ficheros/",
              "~/OPADA/data/SIIU/ficheros-codigos/")
##
##------------------------------------------------------------------------------
##
## Cargamos datasets auxiliares de centros, planes
##
## -----------------------------------------------------------------------------
##
planes <- read.table(file = datafile("planes_centros.txt"),
                     sep = "|",
                     header = TRUE, skip = 6, colClasses = "character", 
                     fileEncoding = "latin1") %>%
  ## hemos hecho el select y el distinct porque hay un plan que se repite.
  select(-contains("FECHA")) %>%
  distinct

## centros <- xmlToDataFrame(datafile("U06414AX0101_02.XML"))
## centros <- centros %>%
## mutate(CENTRO_ID = plyr::mapvalues(Unidad,
##                                    from = c(30013906,
##                                             30008391,
##                                             30013086,
##                                             30013104,
##                                             30013074,
##                                             30013098,
##                                             30013271,
##                                             30013396,
##                                             30013891),
##                                    to = c(222,
##                                           6401,
##                                           6402,


##
## -----------------------------------------------------------------------------
##                Datos alumnos
##        Cargamos los datos de los ficheros Avance SIIU curso 2014-15
## -----------------------------------------------------------------------------
alumnos.grados <-
  rbind(
    xmlToDataFrame(datafile("U06414AC0101_02.XML")),
    xmlToDataFrame(datafile("U06414AC0102_01.XML")))
alumnos.ciclos <- xmlToDataFrame(datafile("U06414AC0103_01.XML"))
alumnos.masteres <- xmlToDataFrame(datafile("U06414AC0105_02.XML"))
alumnos <- rbind(
  alumnos.grados %>%
    mutate(Tipo = "Grado") %>%
    select(Universidad, Centro, Tipo, Titulacion, Sexo),
  alumnos.ciclos %>%
    mutate(Tipo = "Primer y segundo ciclo") %>%
    select(Universidad, Centro, Tipo, Titulacion, Sexo),
  alumnos.masteres %>%
    mutate(Tipo = "Máster",
           Centro = Unidad) %>%
    select(Universidad, Centro, Tipo, Titulacion, Sexo)) %>%
  mutate(Sexo = plyr::mapvalues(Sexo, from = c("H", "M"),
                                to = c("Hombre", "Mujer")))
## -----------------------------------------------------------------------------
## We check that all programmes of `alumnos` are in `planes`.
if (sum(!alumnos$Titulacion %in% planes$TITULO_MINISTERIO_ID) >0)
  stop("Alguna titulacion de alumnos no está en planes")
## -----------------------------------------------------------------------------
## We add name of programm, of school
alumnos <- alumnos %>%
  left_join(planes %>%
              select(TITULO_MINISTERIO_ID, SUBTIPO_ESTUDIO_ID,
                     PLAN_ID, PLAN_DESC, PLAN_ACRONIMO,
                     CENTRO_ACRONIMO, CENTRO_DESC),
            by = c("Titulacion" = "TITULO_MINISTERIO_ID"))
## -----------------------------------------------------------------------------
##
## We now get international students information
##
## -----------------------------------------------------------------------------
##
## OJO: uso el fichero de movilidades entrantes del curso anterior 2013-14!
incoming <- xmlToDataFrame(datafile("U06413AC0401_02.XML")) %>%
  mutate(Sexo = plyr::mapvalues(Sexo, from = c("H", "M"),
                                to = c("Hombre", "Mujer")))
## nos quedamos sólo con el Sexo..
incoming <- incoming[c("Universidad", "Sexo")]

## We save the  object for further use
save(alumnos, incoming, file = "data/alumnos.Rdata")
