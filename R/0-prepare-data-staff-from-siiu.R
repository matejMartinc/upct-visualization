## -----------------------------------------------------------------------------
##
## Prepare
##
## -----------------------------------------------------------------------------
##
library("opadar")
library("dplyr")
library("XML")
library("readxl")
datapath <- c("~/OPADA/data/SIIU/ficheros/",
              "~/OPADA/data/SIIU/ficheros-codigos/",
              "~/OPADA/data/rrhh/")
##
##------------------------------------------------------------------------------
##
## Cargamos de informedatasets auxiliares de centros, planes
##
## -----------------------------------------------------------------------------
##
informe.pdi <- read_excel(datafile("siiu-pdi-31-12-2014.xls"),
                       sheet = 1,
                       col_types = rep("text", 39)) %>%
  filter(SIT_ADTVA_28 == "01") %>%
  ## hay que poner distinct porque este informe pone varias filas para algunos
  ## registros 
  distinct
informe.pdi <- informe.pdi  %>%
  rename(Sexo = SEXO_12,
         CategoriaCuerpoEscala = CCE_24,
         NumDocIdentificativo = DOC_6,
         HorasSemanales = H_SEM_27,
         TipoPersonal = TIPO_PERSONAL_23) %>%
  select(NumDocIdentificativo,
         Sexo,
         CategoriaCuerpoEscala,
         TipoPersonal,
         ID_TIPO_REGIMEN_JURIDICO)
categorias.pdi  <- siiu_codigos_categoria_pdi %>%
  filter(TipoCentro == "Centros propios")
informe.pdi <- informe.pdi %>%
  left_join(categorias.pdi,
            by = c("CategoriaCuerpoEscala" = "ID")) %>%
  rename(CategoriaCuerpoEscala_DESC = NOMBRE)
##-----------------------------------------------------------------------------
## Cambiamos la CategoríaCuerpoEscala_DESC de los LI y LIF por Laboral de
##investigación y Laboral de investigación en formación
## -----------------------------------------------------------------------------
informe.pdi$CategoriaCuerpoEscala_DESC[informe.pdi$ID_TIPO_REGIMEN_JURIDICO ==
                                      "LI"] <- "Laboral de Investigación"
informe.pdi$CategoriaCuerpoEscala_DESC[informe.pdi$ID_TIPO_REGIMEN_JURIDICO ==
                                      "LIF"] <- "Laboral de Investigación en Formación"
informe.pdi <- informe.pdi %>%
  mutate(CategoriaCuerpoEscala_DESC =
           plyr::mapvalues(CategoriaCuerpoEscala_DESC,
                           from = "Otro personal docente",
                           to = "Docente de sustitución"),
         Tipo = plyr::mapvalues(TipoPersonal,
                                from = c("1", "4", "5", "6"),
                                to = c(rep("Funcionario", 3), "Laboral")),
         Sexo = plyr::mapvalues(Sexo,
                                from = c("H", "M"),
                                to = c("Hombre", "Mujer")))

## -----------------------------------------------------------------------------
##
## We now get Administrative staff information
##
## -----------------------------------------------------------------------------
##
informe.pas <- read_excel(datafile("Informe SIIU PAS a 31-12-2014.xls"),
                                sheet = 1,
                                col_types = rep("text", 28)) %>%
  filter(SIT_ADTVA_21 == "01")


informe.pas <- informe.pas %>%
  rename(NumDocIdentificativo = DOC_6,
         Sexo = SEXO_12,
         RegimenDedicacion = DED_19,
         TipoPersonal = TIPO_PERSONAL_15,
         TitulacionExigidaPAS = TIT_EXIG_17,
         CuerpoEscalaPAS = CCE_16,
         HorasSemanales = H_SEM_20) %>%
  select(NumDocIdentificativo,
         Sexo, 
         TipoPersonal, TitulacionExigidaPAS,
         CuerpoEscalaPAS, HorasSemanales,
         ID_TIPO_REGIMEN_JURIDICO)

informe.pas <- informe.pas %>%
  mutate(CuerpoEscalaPAS_DESC = plyr::mapvalues(CuerpoEscalaPAS,
                                    from = paste(1:6),
                                    to = c("Subgrupo A1", "Subgrupo A2",
                                           "Grupo B",
                                           "Subgrupo C1", "Subgrupo C2",
                                           "Otros sin requisito titulación")),
         TipoPersonal_DESC =  plyr::mapvalues(TipoPersonal,
                                from = c("1", "4", "5", "6"),
                                to = c(rep("Funcionario", 3), "Laboral")),
         TipoFuncionario = plyr::mapvalues(ID_TIPO_REGIMEN_JURIDICO,
                                           from = c("FC", "FI"),
                                           to = c("Funcionario Carrera",
  "Funcionario Interino")),
         Sexo = plyr::mapvalues(Sexo,
                                from = c("H", "M"),
                                to = c("Hombre", "Mujer")))


## We save the  object for further use
save(informe.pas, informe.pdi, file = "data/staff.Rdata")
