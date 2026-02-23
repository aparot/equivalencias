export const methodMetadata = {
  title: "Herramienta de Eco Equivalencia",
  subtitle: "Emisiones evitadas por el reciclaje de materiales",
  version: "2.0",
  updatedAt: "Enero 2025",
};

export const overviewParagraphs = [
  "Esta herramienta estima emisiones evitadas de GEI asociadas al reciclaje, expresadas en CO2e, para comunicar el impacto de forma comparable y trazable.",
  "El cálculo integra CO2, CH4, N2O y otros GEI mediante factores de equivalencia en CO2e, siguiendo la práctica estándar de inventarios de emisiones.",
  "La metodología compara un escenario base y un escenario de reciclaje total, y considera las diferencias de emisiones a lo largo del ciclo de vida del material.",
  "Los factores base de manejo de materiales provienen del modelo WARM (Waste Reduction Model) de la EPA de Estados Unidos.",
];

export const scenarioList = [
  "Escenario base (business-as-usual): extracción/refinado, producción, recolección al fin de vida y disposición en relleno sanitario.",
  "Escenario reciclaje 100%: extracción/refinado, producción, recolección, proceso de reciclaje y descuento por sustitución de material virgen.",
];

export const mixedMaterials = [
  {
    label: "Metales mezclados",
    composition: "Latas de aluminio 35%, latas de acero 65%.",
  },
  {
    label: "Plásticos mezclados",
    composition: "HDPE 40%, PET 60%.",
  },
  {
    label: "Equipos electrónicos mezclados",
    composition:
      "Computadores 11%, equipos electrónicos portátiles 5%, monitores de pantalla plana 23%, pantallas CRT 44%, periféricos electrónicos 2%, impresoras 15%.",
  },
  {
    label: "Papel mezclado (general)",
    composition:
      "Contenedores de cartón corrugado 48%, revistas/correo 8%, papel de diario 24%, papel de oficina 20%.",
  },
  {
    label: "Papel mezclado (residencial)",
    composition:
      "Contenedores de cartón corrugado 53%, revistas/correo 10%, papel de diario 23%, papel de oficina 14%.",
  },
  {
    label: "Papel mezclado (oficinas)",
    composition:
      "Contenedores de cartón corrugado 5%, revistas/correo 36%, papel de diario 21%, papel de oficina 38%.",
  },
  {
    label: "Residuos de alimentos",
    composition:
      "Carne 9%, pollo 11%, granos 13%, frutas y verduras 49%, lácteos 18%.",
  },
  {
    label: "Residuos de alimentos (sin carne)",
    composition: "Granos 16%, frutas y verduras 61%, lácteos 22%.",
  },
  {
    label: "Residuos de alimentos (sólo carne)",
    composition: "Carne 46%, pollo 54%.",
  },
  {
    label: "Mezcla de orgánicos",
    composition: "Desechos de alimentos 53%, cortes de jardines 47%.",
  },
];

export const notes = {
  tetrapak:
    "Se considera que el tetrapak está compuesto por 75% cartón, 20% polietileno de alta densidad y 5% aluminio.",
  rounding:
    "Por redondeo, los cálculos pueden presentar pequeñas diferencias respecto a los valores mostrados.",
  factorUnit:
    "Los factores se reportan por tonelada corta de material y se convierten a kgCO2e/kg para la calculadora.",
};

export const references = [
  {
    id: "WB",
    label: "Herramienta Eco Equivalencia (v2.0, actualizada en enero 2025).",
  },
  {
    id: "WARM",
    label: "EPA WARM (Waste Reduction Model) v15.",
    url: "https://www.epa.gov/warm/versions-waste-reduction-model-warm",
  },
  {
    id: "EPA-CALC",
    label: "EPA Greenhouse Gas Equivalencies Calculator - Calculations and References.",
    url: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references",
  },
  {
    id: "EPA-CALC-ES",
    label: "EPA Calculadora de equivalencias GEI (español) - Cálculos.",
    url: "https://espanol.epa.gov/la-energia-y-el-medioambiente/calculadora-de-equivalencias-de-gases-de-efecto-invernadero-calculos",
  },
];

export const equivalenceAssumptions = [
  {
    "item": "Automóviles a gasolina al año",
    "factor": "4.641035402",
    "unit": "ton CO2e / vehículo / año",
    "explanation": "Los vehículos de pasajeros se definen como vehículos de 2 ejes y 4 neumáticos, incluidos automóviles, furgonetas, camionetas y vehículos deportivos/utilitarios.\n\nEn 2019, el rendimiento de combustible combinado promedio ponderado de automóviles y camiones ligeros fue de 22,2 millas por galón (FHWA 2020). El promedio de millas recorridas por vehículo (VMT) en 2019 fue de 11,520 millas por año (FHWA 2020).\n\nEn 2019, la relación entre las emisiones de dióxido de carbono y las emisiones totales de gases de efecto invernadero (incluidos el dióxido de carbono, el metano y el óxido nitroso, todos expresados como equivalentes de dióxido de carbono) para los vehículos de pasajeros fue de 0,994 (EPA 2021).\n\nLa cantidad de dióxido de carbono emitida por galón de gasolina de motor quemada es de 8,89 × 10-3 toneladas métricas, tal como se ha calculado en la sección \"Galones de gasolina consumidos\" anterior.\n\nPara determinar las emisiones anuales de gases de efecto invernadero por vehículo de pasajeros, se utilizó la siguiente metodología: El VMT se dividió por el kilometraje medio de gasolina para determinar los galones de gasolina consumidos por vehículo al año. Los galones de gasolina consumidos se multiplicaron por el dióxido de carbono por galón de gasolina para determinar el dióxido de carbono emitido por vehículo al año. A continuación, las emisiones de dióxido de carbono se dividieron por la relación entre las emisiones de dióxido de carbono y las emisiones totales de gases de efecto invernadero de los vehículos para tener en cuenta las emisiones de metano y óxido nitroso de los vehículos.",
    "calc": "8,89 × 10-3 toneladas métricas CO2/galón gasolina × 11.520 VMT media coche/camión × 1/22,2 millas por galón media coche/camión × 1 CO2, CH4, y N2O/0,994 CO2 = 4,64 toneladas métricas CO2E/vehículo/año",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#vehicles"
  },
  {
    "item": "Kilómetros recorridos por un turismo medio de gasolina",
    "factor": "0.000250330356",
    "unit": "ton CO2e / km",
    "explanation": "Los vehículos de pasajeros se definen como vehículos de 2 ejes y 4 neumáticos, incluidos automóviles, furgonetas, camionetas y vehículos deportivos/utilitarios.\n\nEn 2019, la economía de combustible combinada promedio ponderada de automóviles y camiones ligeros fue de 22,2 millas por galón (FHWA 2020). En 2019, la relación entre las emisiones de dióxido de carbono y las emisiones totales de gases de efecto invernadero (incluidos el dióxido de carbono, el metano y el óxido nitroso, todos expresados como equivalentes de dióxido de carbono) para los vehículos de pasajeros fue de 0,994 (EPA 2021).\n\nLa cantidad de dióxido de carbono emitida por galón de gasolina de motor quemada es de 8,89 × 10-3 toneladas métricas, tal como se ha calculado en la sección \"Galones de gasolina consumidos\" anterior.\n\nPara determinar las emisiones anuales de gases de efecto invernadero por milla, se utilizó la siguiente metodología: las emisiones de dióxido de carbono por galón de gasolina se dividieron por la economía media de combustible de los vehículos para determinar el dióxido de carbono emitido por milla recorrida por un vehículo de pasajeros típico. A continuación, las emisiones de dióxido de carbono se dividieron por la relación entre las emisiones de dióxido de carbono y las emisiones totales de gases de efecto invernadero de los vehículos para tener en cuenta las emisiones de metano y óxido nitroso de los vehículos.",
    "calc": "8,89 × 10-3 toneladas métricas CO2/galón gasolina × 1/22,2 millas por galón media coche/camión × 1 CO2, CH4, y N2O/0,994 CO2 = 4,03 x 10-4 toneladas métricas CO2E/milla / 1,609344 km/milla = 0,65 ton CO2e por km",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#miles"
  },
  {
    "item": "Energía consumida por un hogar durante 1 año",
    "factor": "3.752360519",
    "unit": "ton CO2e / hoigar por año",
    "explanation": "En 2019, había 120.9 millones de hogares en los Estados Unidos (EIA 2020a). En promedio, cada hogar consumió 11,880 kWh de electricidad suministrada. El consumo de gas natural, gas licuado de petróleo y fuelóleo en el hogar a nivel nacional alcanzó un total de 5.23, 0.46 y 0.45 mil billones de Btu, respectivamente, en 2019 (EIA 2020a). Promediado en todos los hogares de los Estados Unidos, esto equivale a 41,510 pies cúbicos de gas natural, 42 galones de gas licuado de petróleo y 27 galones de fuelóleo por hogar.\n\nLa tasa de salida de dióxido de carbono promedio nacional para la electricidad generada en 2019 fue de 884.2 lb de CO2 por megavatio-hora (EPA 2021), lo que se traduce en aproximadamente 953.7 lb de CO2 por megavatio-hora por electricidad suministrada (si suponemos pérdidas de transmisión y distribución del 7.3 %) (EPA 2021; EIA 2020b).1\n\nEl coeficiente promedio de dióxido de carbono de gas natural es de 0.0551 kg de CO2 por pie cúbico (EIA 2019). La fracción que se oxida a CO2 es del 100 por ciento (IPCC 2006).\n\nEl coeficiente promedio de dióxido de carbono de fuelóleo destilado es de 431.87 kg de CO2 por barril de 42 galones (EPA 2021). La fracción que se oxida a CO2 es del 100 por ciento (IPCC 2006).\n\nEl coeficiente promedio de dióxido de carbono de gases licuados de petróleo es de 235.7 kg de CO2 por barril de 42 galones (EPA 2021). La fracción que se oxida es del 100 por ciento (IPCC 2006).\n\nLas cifras de consumo doméstico total de electricidad, gas natural, fuelóleo destilado y gas licuado de petróleo fueron convertidas desde sus diversas unidades a toneladas métricas de CO2 y sumadas para obtener el total de emisiones de CO2 por hogar.",
    "calc": "1. Electricidad: 11,880 kWh por hogar × 884.2 lb de CO2 por megavatio-hora generado × (1/(1-0.073)) MWh suministrado/MWh generado × 1 MWh/1,000 kWh × 1 tonelada métrica/2,204.6 lb = 5.139 toneladas métricas de CO2/hogar.\n\n2. Gas natural: 41,510 pies cúbicos por hogar × 0.0551 kg de CO2/pie cúbico × 1/1,000 kg/tonelada métrica = 2.29 toneladas métricas de CO2/hogar\n\n3. Gas licuado de petróleo: 42 galones por hogar × 1/42 barriles/galón × 235.7 kg de CO2/barril × 1/1,000 kg/tonelada métrica = 0.23 tonelada métrica de CO2/hogar\n\n4. Fuelóleo: 27 galones por hogar × 1/42 barriles/galón × 431.87 kg de CO2/barril × 1/1,000 kg/tonelada métrica = 0.28 tonelada métrica de CO2/hogar\n\nTotal de emisiones de CO2 por consumo de energía por hogar: 5.139 toneladas métricas de CO2 por electricidad + 2.29 toneladas métricas de CO2 por gas natural + 0.23 tonelada métrica de CO2 por gas licuado de petróleo + 0.29 tonelada métrica de CO2 por fuelóleo = 7.94 toneladas métricas de CO2 por hogar por año.",
    "source": "https://espanol.epa.gov/la-energia-y-el-medioambiente/calculadora-de-equivalencias-de-gases-de-efecto-invernadero-calculos"
  },
  {
    "item": "Camiones cisterna llenos de gasolina",
    "factor": "75.565",
    "unit": "ton CO2e / camión cisterna",
    "explanation": "La cantidad de dióxido de carbono emitida por galón de gasolina de motor quemado es de 8,89 × 10-3 toneladas métricas, tal y como se ha calculado en el apartado \"Galones de gasolina consumidos\" anterior. Un barril equivale a 42 galones. Un camión cisterna de gasolina típico contiene 8.500 galones.",
    "calc": "8,89 × 10-3 toneladas métricas de CO2/galón × 8.500 galones/camión cisterna = 75,57 toneladas métricas de CO2/camión cisterna",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#tankers"
  },
  {
    "item": "Litros de gasolina consumidos",
    "factor": "0.002347697029",
    "unit": "ton CO2e / litro de gasolina",
    "explanation": "El factor de emisión es 8,887 gramos de CO2 por galón de gasolina. Se ajustan las unidades para indicar las toneladas de CO2e por litro de gasolina.",
    "calc": "8,89 × 10-3 toneladas métricas de CO2/galón / 3,785411784 litros/galón =  2,35 × 10-3 toneladas métricas de CO2/litro",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references"
  },
  {
    "item": "Balones de gas consumidos",
    "factor": "0.0244885249",
    "unit": "ton CO2e / balón de gas",
    "explanation": "El propano es 81.8 % carbono (EPA 2021). Se asume que la fracción que se oxida es del 100 % (IPCC 2006).\n\nSe determinaron las emisiones de dióxido de carbono por libra de propano al multiplicar el peso del propano en un cilindro por el porcentaje de contenido de carbono por la fracción oxidada por la proporción del peso molecular del dióxido de carbono y el del carbón (44/12). Los cilindros de propano varían con respecto al tamaño; a los fines de este cálculo de equivalencia, se asumió que un cilindro típico para el uso doméstico contenía 18 libras de propano.",
    "calc": "18 libras de propano/1 cilindro × 0.818 libra de C/libra de propano × 0.4536 kilogramo/libra × 44 kg de CO2/12 kg de C × 1 tonelada métrica/1,000 kg = 0.024 tonelada métrica de CO2/cilindro",
    "source": "https://espanol.epa.gov/la-energia-y-el-medioambiente/calculadora-de-equivalencias-de-gases-de-efecto-invernadero-calculos"
  },
  {
    "item": "Número de smartphones cargados",
    "factor": "0.000008220919895",
    "unit": "ton de CO2 / teléfono inteligente cargado",
    "explanation": "Según el DOE de EE.UU., la energía consumida durante 24 horas por la batería de un smartphone común es de 14,46 vatios-hora (DOE 2020). Esto incluye la cantidad de energía necesaria para cargar una batería de smartphone completamente agotada y mantener esa carga completa durante todo el día. El tiempo medio necesario para recargar completamente la batería de un smartphone es de 2 horas (Ferreira et al. 2011). La energía en modo de mantenimiento, también conocida como la energía consumida cuando el teléfono está completamente cargado y el cargador sigue enchufado, es de 0,13 vatios (DOE 2020). Para obtener la cantidad de energía consumida para cargar el smartphone, reste la cantidad de energía consumida en \"modo de mantenimiento\" (0,13 vatios por 22 horas) de la energía consumida durante 24 horas (14,46 vatios-hora).\n\nLas emisiones de dióxido de carbono por smartphone cargado se determinaron multiplicando el consumo de energía por smartphone cargado por la tasa media ponderada nacional de emisión marginal de dióxido de carbono para la electricidad suministrada. La tasa media ponderada nacional de emisiones marginales de dióxido de carbono para la electricidad suministrada en 2019 fue de 1.562,4 libras de CO2 por megavatio-hora, que tiene en cuenta las pérdidas durante la transmisión y distribución (EPA 2020).",
    "calc": "[14,46 Wh - (22 horas x 0,13 vatios)] x 1 kWh/1.000 Wh = 0,012 kWh/teléfono inteligente cargado\n\n0,012 kWh/carga x 1.562,4 libras de CO2/MWh de electricidad suministrada x 1 MWh/1.000 kWh x 1 tonelada métrica/2.204,6 libras = 8,22 x 10-6 toneladas métricas de CO2/teléfono inteligente cargado",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#smartphones"
  },
  {
    "item": "Número de turbinas de viento funcionando por un año",
    "factor": "3678.926562",
    "unit": "ton CO2e / año / turbina ",
    "explanation": "En 2019, la capacidad nominal media de las turbinas eólicas instaladas en Estados Unidos fue de 1,82 MW (DOE 2021). El factor de capacidad eólica medio en Estados Unidos en 2019 fue del 35,6% (DOE 2021).\n\nLa generación de electricidad a partir de un aerogenerador medio se determinó multiplicando la capacidad nominal media de un aerogenerador en Estados Unidos (1,82 MW) por el factor de capacidad eólica medio de Estados Unidos (0,356) y por el número de horas al año. Se supuso que la electricidad generada por un aerogenerador instalado sustituiría a las fuentes marginales de electricidad de la red.\n\nLa tasa de emisión marginal nacional anual de la energía eólica de EE.UU. para convertir las reducciones de kilovatios-hora en unidades evitadas de emisiones de dióxido de carbono es de 6,48 x 10-4 (EPA 2020).\n\nLas emisiones de dióxido de carbono evitadas al año por aerogenerador instalado se determinaron multiplicando la electricidad media generada por aerogenerador en un año por la tasa de emisión marginal nacional eólica anual (EPA 2020).",
    "calc": "1,82 MWcapacidad media x 0,356 x 8.760 horas/año x 1.000 kWh/MWh x 6,4818 x 10-4 toneladas métricas de CO2/kWh reducidas = 3.679 toneladas métricas de CO2/año/aerogenerador instalado",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#wind"
  },
  {
    "item": "Número de bombillas incandescentes sustituidas por bombillas de diodos luminosos",
    "factor": "0.02638490066",
    "unit": "ton CO2e / bombilla sustituida",
    "explanation": "Una bombilla de diodo emisor de luz (LED) de 9 vatios produce la misma potencia luminosa que una bombilla incandescente de 43 vatios. La energía anual consumida por una bombilla se calcula multiplicando la potencia (43 vatios) por el uso medio diario (3 horas/día) por el número de días al año (365). Suponiendo un uso medio diario de 3 horas al día, una bombilla incandescente consume 47,1 kWh al año, y una bombilla LED consume 9,9 kWh al año (EPA 2019). El ahorro energético anual de sustituir una bombilla incandescente por una bombilla LED equivalente se calcula multiplicando la diferencia de 34 vatios de potencia entre las dos bombillas (43 vatios menos 9 vatios) por 3 horas al día y por 365 días al año.\n\nLas emisiones de dióxido de carbono reducidas por cada bombilla incandescente sustituida por una bombilla de diodo emisor de luz se calculan multiplicando el ahorro energético anual por la tasa media ponderada nacional de emisión marginal de dióxido de carbono para la electricidad suministrada. La media nacional ponderada de la tasa de emisión marginal de dióxido de carbono para la electricidad suministrada en 2019 fue de 1.562,4 libras de CO2 por megavatio-hora, que tiene en cuenta las pérdidas durante la transmisión y distribución (EPA 2020).",
    "calc": "34 vatios x 3 horas/día x 365 días/año x 1 kWh/1.000 Wh = 37,2 kWh/año/bombilla sustituida\n\n37,2 kWh/bombilla/año x 1.562,4 libras CO2/MWh electricidad suministrada x 1 MWh/1.000 kWh x 1 tonelada métrica/2.204,6 libras = 2,64 x 10-2 toneladas métricas CO2/bombilla sustituida",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#lights"
  },
  {
    "item": "Número de árboles urbanos cultivados durante 10 años",
    "factor": "0.06049351356",
    "unit": "ton CO2e / árbol plantado",
    "explanation": "Un árbol de crecimiento medio de coníferas o de hoja caduca, plantado en un entorno urbano y dejado crecer durante 10 años, secuestra 23,2 y 38,0 libras de carbono, respectivamente. Estas estimaciones se basan en los siguientes supuestos:\n\nLas coníferas y los árboles de hoja caduca de crecimiento medio se crían en un vivero durante un año hasta que alcanzan 1 pulgada de diámetro a 4,5 pies sobre el suelo (el tamaño del árbol comprado en un contenedor de 15 galones).\nA continuación, los árboles crecidos en vivero se plantan en un entorno suburbano/urbano; los árboles no se plantan densamente.\nEl cálculo tiene en cuenta los \"factores de supervivencia\" desarrollados por el DOE de EE.UU. (1998). Por ejemplo, después de 5 años (un año en el vivero y 4 en el entorno urbano), la probabilidad de supervivencia es del 68%; después de 10 años, la probabilidad desciende al 59%. Para estimar las pérdidas de árboles en crecimiento, en lugar de realizar un censo para contabilizar con precisión la cantidad total de plántulas plantadas frente a las que sobreviven hasta una determinada edad, la tasa de secuestro (en libras por árbol) se multiplica por el factor de supervivencia para obtener una tasa de secuestro ponderada por la probabilidad. Estos valores se suman para el periodo de 10 años, a partir del momento de la plantación, para obtener la estimación de 23,2 libras de carbono por árbol de conífera o 38,0 libras de carbono por árbol de hoja caduca.\nLas estimaciones de carbono secuestrado por coníferas y árboles de hoja caduca se ponderaron por el porcentaje de coníferas frente a árboles de hoja caduca en las ciudades de Estados Unidos. De una muestra de aproximadamente 11.000 árboles de coníferas y de hoja caduca en diecisiete grandes ciudades de Estados Unidos, aproximadamente el 11% y el 89% de los árboles muestreados eran de coníferas y de hoja caduca, respectivamente (McPherson et al. 2016). Por lo tanto, la media ponderada de carbono secuestrado por un árbol de crecimiento medio de coníferas o de hoja caduca, plantado en un entorno urbano y dejado crecer durante 10 años, es de 36,4 libras de carbono por árbol.\n\nHay que tener en cuenta las siguientes advertencias:\n\nAunque la mayoría de los árboles tardan 1 año en alcanzar la fase de plántula en un vivero, los árboles que crecen en condiciones diferentes y los árboles de determinadas especies pueden tardar más: hasta 6 años.\nLas tasas medias de supervivencia en zonas urbanas se basan en supuestos generales, y las tasas variarán significativamente en función de las condiciones del lugar.\nEl secuestro de carbono depende de la tasa de crecimiento, que varía según el lugar y otras condiciones.\nEste método sólo estima el secuestro directo de carbono y no incluye el ahorro de energía resultante de la sombra de los edificios por la cubierta arbórea urbana.\nEste método se utiliza mejor como estimación para zonas suburbanas/urbanas (es decir, parques, a lo largo de aceras, patios) con plantaciones de árboles muy dispersas y no es apropiado para proyectos de reforestación.\nPara convertir a unidades de toneladas métricas de CO2 por árbol, multiplique por la relación entre el peso molecular del dióxido de carbono y el del carbono (44/12) y la relación de toneladas métricas por libra (1/2.204,6).",
    "calc": "(0,11 [porcentaje de coníferas en los entornos urbanos de la muestra] × 23,2 libras de C/árbol de coníferas) + (0,89 [porcentaje de árboles de hoja caduca en los entornos urbanos de la muestra] × 38,0 libras de C/árbol de hoja caduca) = 36,4 libras de C/árbol\n\n36,4 lbs C/árbol × (44 unidades CO2/12 unidades C) × 1 tonelada métrica/2.204,6 lbs = 0,060 toneladas métricas CO2 por árbol urbano plantado",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#seedlings"
  },
  {
    "item": "Hectáreas de bosques estadounidenses que capturan CO2 durante un año",
    "factor": "2.083920208",
    "unit": "ton CO2e / há / año",
    "explanation": "Los bosques se definen aquí como bosques gestionados que han sido clasificados como bosques durante más de 20 años (es decir, excluidos los bosques convertidos a/de otros tipos de uso del suelo). Consulte el Inventario de emisiones y sumideros de gases de efecto invernadero de Estados Unidos: 1990-2019 para una discusión sobre la definición de bosques estadounidenses y la metodología para estimar el carbono almacenado en los bosques estadounidenses (EPA 2021). l Inventario de emisiones y sumideros de gases de efecto invernadero de Estados Unidos: 1990-2019 (EPA 2021) proporciona datos sobre el cambio neto en las reservas forestales de carbono y la superficie forestal. \nCambio neto anual en las reservas de carbono por superficie en el año t = (Reservas de carbono(t+1) - Reservas de carbonost)/Superficie de tierra que permanece en la misma categoría de uso de la tierra.\n\nPaso 1: Determinar la variación de las reservas de carbono entre años restando las reservas de carbono del año t de las reservas de carbono del año (t+1). Este cálculo, que también se encuentra en el Inventario de emisiones y sumideros de gases de efecto invernadero de Estados Unidos: 1990-2019 (EPA 2021), utiliza las estimaciones del Servicio Forestal del USDA de las reservas de carbono en 2020 menos las reservas de carbono en 2019. (Este cálculo incluye las reservas de carbono en la biomasa aérea, la biomasa subterránea, la madera muerta, la hojarasca y los reservorios de carbono orgánico y mineral del suelo. Las ganancias de C atribuidas a los productos madereros recolectados no se incluyen en este cálculo).\nCambio neto anual en las reservas de carbono en el año 2019 = 55.993 MMT C - 55.774MMT C = 159 MMT C\n\nPaso 2: Determinar el cambio neto anual en las reservas de carbono (es decir, el secuestro) por superficie dividiendo el cambio en las reservas de carbono en los bosques de EE.UU. del Paso 1 por la superficie total de bosques de EE.UU. que permanecían en bosques en el año t (es decir, la superficie de tierra que no cambió de categoría de uso de la tierra entre los periodos de tiempo).\nAplicando el cálculo del Paso 2 a los datos desarrollados por el Servicio Forestal del USDA para el Inventario de Emisiones y Sumideros de Gases de Efecto Invernadero de Estados Unidos: 1990-2019 arroja un resultado de 200 toneladas métricas de carbono por hectárea (o 81 toneladas métricas de carbono por acre) para la densidad de las reservas de carbono de los bosques estadounidenses en 2019, con un cambio neto anual en las reservas de carbono por área en 2019 de 0,57 toneladas métricas de carbono secuestrado por hectárea y año (o 0,23 toneladas métricas de carbono secuestrado por acre y año).\nLos bosques en crecimiento acumulan y almacenan carbono. Mediante el proceso de fotosíntesis, los árboles extraen CO2 de la atmósfera y lo almacenan en forma de celulosa, lignina y otros compuestos. La tasa de acumulación de carbono en un paisaje forestal es igual al crecimiento total de los árboles menos las extracciones (es decir, la cosecha para la producción de papel y madera y la pérdida de árboles por perturbaciones naturales) menos la descomposición. En la mayoría de los bosques de EE.UU., el crecimiento supera las extracciones y la descomposición, por lo que la cantidad de carbono almacenada a nivel nacional en las tierras forestales está aumentando en general, aunque a un ritmo decreciente.",
    "calc": "Densidad de las reservas de carbono en el año 2019 = (55.897 MMT C × 106) / (279.386 mil. hectáreas × 103) = 200 toneladas métricas de carbono almacenado por hectárea\n\nCambio neto anual en las reservas de carbono por superficie en el año 2019 = (-159 MMT C × 106) / (279.386 miles de hectáreas × 103) = -0,57 toneladas métricas de carbono secuestrado por hectárea y año. De 2007 a 2019, el secuestro medio anual de carbono por superficie fue de 0,57 toneladas métricas C/hectárea/año (o 0,23 toneladas métricas C/acre/año) en Estados Unidos, con un valor mínimo de 0,52 toneladas métricas C/hectárea/año (o 0,22 toneladas métricas C/acre/año) en 2014, y un valor máximo de 0,57 toneladas métricas C/hectárea/año (o 0,23 toneladas métricas C/acre/año) en 2011 y 2015.\n\nEstos valores incluyen el carbono de los cinco reservorios forestales: biomasa aérea, biomasa subterránea, madera muerta, hojarasca y carbono orgánico y mineral del suelo, y se basan en datos del Inventario y Análisis Forestal (FIA) a nivel estatal. Las reservas de carbono forestal y los cambios en las reservas de carbono se basan en la metodología de diferencia de reservas y los algoritmos descritos por Smith, Heath y Nichols (2010). -0,23 toneladas métricas C/acre/año* × (44 unidades CO2/12 unidades C) = -0,84 toneladas métricas CO2/acre/año secuestradas anualmente por un acre de bosque medio estadounidense / 0,404686 acre/há = 2,08 toneladas métricas CO2/hectárea/año",
    "source": "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#pineforests"
  }
];

export const unitConversions = [
  {
    "energy": "Combustible de jet",
    "from": "lbs",
    "to": "L",
    "factor": "0.56",
    "source": "https://www.fsmaldives.com/aviation-fuel-jet-a-1-conversion-chart/"
  },
  {
    "energy": "Diesel",
    "from": "Galones US",
    "to": "L",
    "factor": "3.785411784",
    "source": "https://www.unitconverters.net/volume/gallons-to-liters.htm"
  },
  {
    "energy": "Diesel",
    "from": "L",
    "to": "Gallons",
    "factor": "0.26417205235814845",
    "source": "https://www.unitconverters.net/volume/gallons-to-liters.htm"
  },
  {
    "energy": "Diesel",
    "from": "Galones US",
    "to": "GJ",
    "factor": "0.14652",
    "source": "https://hextobinary.com/unit/energy/from/galdieselus/to/gigajoule"
  },
  {
    "energy": "Gasolina",
    "from": "L",
    "to": "Gallons",
    "factor": "0.26417205235814845",
    "source": "https://www.unitconverters.net/volume/gallons-to-liters.htm"
  },
  {
    "energy": "Gasolina",
    "from": "Galones US",
    "to": "GJ",
    "factor": "0.1318",
    "source": "https://www.convertunits.com/from/gallons+of+gasoline/to/gigajoule"
  },
  {
    "energy": "Fuel Oil",
    "from": "Galones US",
    "to": "GJ",
    "factor": "0.15804",
    "source": "https://www.convertunits.com/from/GJ/to/gallon+[U.S.]+of+residual+fuel+oil"
  },
  {
    "energy": "Jet Fuel",
    "from": "Galones US",
    "to": "GJ",
    "factor": "0.1422",
    "source": "https://www.convertunits.com/from/gigajoule/to/gallon+[U.S.]+of+kerosene+type+jet+fuel"
  },
  {
    "energy": "Combustible de jet",
    "from": "MWH",
    "to": "kWh",
    "factor": "1000.0",
    "source": "https://www.asknumbers.com/mwh-to-kwh.aspx"
  },
  {
    "energy": "Electricidad",
    "from": "kWh",
    "to": "GJ",
    "factor": "0.0036",
    "source": "https://www.convertunits.com/from/kWh/to/gigajoule"
  },
  {
    "energy": "Gas natural",
    "from": "kWh",
    "to": "MMBTu",
    "factor": "3412.14",
    "source": "Kilowatt-hours to Million BTU Conversion (kWh to MMBTU) (inchcalculator.com)"
  },
  {
    "energy": "Gas natural",
    "from": "Therms",
    "to": "MMBTu",
    "factor": "0.1",
    "source": "Therm to MMBTU (IT) | Therms to MMBTU (IT)s Conversion (unitsconverters.com)"
  },
  {
    "energy": "Gas natural",
    "from": "Dekatherm",
    "to": "MMBTu",
    "factor": "1.0",
    "source": "http://www.kylesconverter.com/energy,-work,-and-heat/dekatherms-(ec)-to-million-british-thermal-units"
  },
  {
    "energy": "Gas natural",
    "from": "CF",
    "to": "MMBTu",
    "factor": "0.001036",
    "source": "Frequently Asked Questions (FAQs) - U.S. Energy Information Administration (EIA)"
  },
  {
    "energy": "Gas natural",
    "from": "CCF",
    "to": "MMBTu",
    "factor": "0.1036",
    "source": "Frequently Asked Questions (FAQs) - U.S. Energy Information Administration (EIA)"
  },
  {
    "energy": "Gas natural",
    "from": "MCF",
    "to": "MMBTu",
    "factor": "1.036",
    "source": "Frequently Asked Questions (FAQs) - U.S. Energy Information Administration (EIA)"
  },
  {
    "energy": "Gas natural",
    "from": "Btu",
    "to": "MMBTu",
    "factor": "1.0E-6",
    "source": "https://www.convert-measurement-units.com/convert+British+thermal+unit+to+Million+BTU.php"
  },
  {
    "energy": "Gas natural",
    "from": "Mbtu",
    "to": "MMBTu",
    "factor": "0.001",
    "source": "https://www.convert-measurement-units.com/convert+British+thermal+unit+to+Million+BTU.php"
  },
  {
    "energy": "Gas natural",
    "from": "Btu",
    "to": "Therms",
    "factor": "1.0E-5",
    "source": "https://www.convert-measurement-units.com/convert+British+thermal+unit+to+Million+BTU.php"
  },
  {
    "energy": "Gas natural",
    "from": "CF",
    "to": "Therms",
    "factor": "0.1036",
    "source": "Frequently Asked Questions (FAQs) - U.S. Energy Information Administration (EIA)"
  },
  {
    "energy": "Gas natural",
    "from": "CCF",
    "to": "Therms",
    "factor": "10.36",
    "source": "Frequently Asked Questions (FAQs) - U.S. Energy Information Administration (EIA)"
  },
  {
    "energy": "Gas natural",
    "from": "kBtu",
    "to": "MMBTu",
    "factor": "0.001",
    "source": "https://portfoliomanager.energystar.gov/pdf/reference/Thermal%20Conversions.pdf"
  },
  {
    "energy": "Gas natural",
    "from": "m3",
    "to": "GJ",
    "factor": "0.03831417625",
    "source": "https://callmepower.ca/en/faq/gigajoule-cubic-metre-gas"
  },
  {
    "energy": "Gas natural",
    "from": "MJ",
    "to": "MMBTu",
    "factor": "9.48E-4",
    "source": "https://www.inchcalculator.com/convert/megajoule-to-million-btu/"
  },
  {
    "energy": "Gas natural",
    "from": "MMBTu",
    "to": "GJ",
    "factor": "1.055056",
    "source": "https://www.inchcalculator.com/convert/million-btu-to-gigajoule/"
  },
  {
    "energy": "Gas licuado de petroleo",
    "from": "kg",
    "to": "GJ",
    "factor": "0.04993",
    "source": "https://www.convert-me.com/en/convert/energy/lpghhvkg.html?u=lpghhvkg&v=1"
  },
  {
    "energy": "Gas licuado de petroleo",
    "from": "kWh",
    "to": "GJ",
    "factor": "0.0036",
    "source": "https://www.convertunits.com/from/kWh/to/gigajoule"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "kWh",
    "to": "ton-hora",
    "factor": "0.2843451361",
    "source": "Convert Kilowatt-hour to Ton-hour (refrigeration) (unitconverters.net)"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "ton-hora",
    "to": "kWh",
    "factor": "3.5168528419923972",
    "source": "Convert Kilowatt-hour to Ton-hour (refrigeration) (unitconverters.net)"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "Btu",
    "to": "kWh",
    "factor": "2.9307106944E-4",
    "source": "https://www.rapidtables.com/convert/energy/BTU_to_kWh.html"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "m3",
    "to": "kWh",
    "factor": "10.55",
    "source": "https://learnmetrics.com/m3-gas-to-kwh/"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "ton-hora",
    "to": "GJ",
    "factor": "0.0126606",
    "source": "https://www.unitconverters.net/energy/ton-hour-refrigeration-to-gigajoule.htm"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "kWh",
    "to": "MMBTu",
    "factor": "0.003412",
    "source": "https://www.inchcalculator.com/convert/kilowatt-hour-to-million-btu/"
  },
  {
    "energy": "Agua fria adquirida",
    "from": "MMBTu",
    "to": "GJ",
    "factor": "1.055056",
    "source": "https://www.inchcalculator.com/convert/million-btu-to-gigajoule/"
  },
  {
    "energy": "Vapor adquirido",
    "from": "CCF",
    "to": "kWh",
    "factor": "29.893",
    "source": "https://www.abraxasenergy.com/energy-resources/toolbox/conversion-calculators/energy/"
  },
  {
    "energy": "Vapor adquirido",
    "from": "lbs",
    "to": "kWh",
    "factor": "0.305",
    "source": "https://www.abraxasenergy.com/energy-resources/toolbox/conversion-calculators/power/"
  },
  {
    "energy": "Vapor adquirido",
    "from": "klbs",
    "to": "kWh",
    "factor": "305.0",
    "source": "https://www.abraxasenergy.com/energy-resources/toolbox/conversion-calculators/power/"
  },
  {
    "energy": "Vapor adquirido",
    "from": "kWh",
    "to": "GJ",
    "factor": "0.0036",
    "source": "https://www.convertunits.com/from/kWh/to/gigajoule"
  },
  {
    "energy": "Vapor adquirido",
    "from": "Mlbs",
    "to": "kWh",
    "factor": "305000.0",
    "source": "https://www.abraxasenergy.com/energy-resources/toolbox/conversion-calculators/power/"
  }
];

export const materialFactors = [
  {
    "material": "Contenedores de corrugado",
    "produced": "5.575208316082944",
    "reduced": "-5.575208316082944",
    "recycled": "-3.1353369086789917",
    "landfill": "0.18162984857485934",
    "incinerated": "-0.48903030248074875",
    "composted": null,
    "digested": null,
    "netReduction": "3.316966757",
    "note": "carton"
  },
  {
    "material": "Tetrapak",
    "produced": "4.839130084",
    "reduced": "-4.839130084",
    "recycled": "-2.863375966",
    "landfill": "0.1412860162",
    "incinerated": "-0.1078672969",
    "composted": null,
    "digested": null,
    "netReduction": "3.004661983",
    "note": "tetrapak"
  },
  {
    "material": "Revistas / Correo",
    "produced": "8.566228895806027",
    "reduced": "-8.566228895806027",
    "recycled": "-3.06969993959657",
    "landfill": "-0.4268442093988676",
    "incinerated": "-0.3535151759422549",
    "composted": null,
    "digested": null,
    "netReduction": "2.64285573",
    "note": "revistas"
  },
  {
    "material": "Papel de diario",
    "produced": "4.677236526027995",
    "reduced": "-4.677236526027995",
    "recycled": "-2.70827152821093",
    "landfill": "-0.8461388148391911",
    "incinerated": "-0.5578886889067509",
    "composted": null,
    "digested": null,
    "netReduction": "1.862132713",
    "note": "diario"
  },
  {
    "material": "Papel de oficina",
    "produced": "7.94895899216696",
    "reduced": "-7.94895899216696",
    "recycled": "-2.8637458899895774",
    "landfill": "1.1338746968208027",
    "incinerated": "-0.4705820247502983",
    "composted": null,
    "digested": null,
    "netReduction": "3.997620587",
    "note": null
  },
  {
    "material": "Guías de teléfono",
    "produced": "6.165082635889792",
    "reduced": "-6.165082635889792",
    "recycled": "-2.6222802143476724",
    "landfill": "-0.8461388148391911",
    "incinerated": "-0.5578886889067509",
    "composted": null,
    "digested": null,
    "netReduction": "1.7761414",
    "note": null
  },
  {
    "material": "Libros de colegio",
    "produced": "9.023763926715757",
    "reduced": "-9.023763926715757",
    "recycled": "-3.1044786327343226",
    "landfill": "1.1338746968208027",
    "incinerated": "-0.4705820247502983",
    "composted": null,
    "digested": null,
    "netReduction": "4.23835333",
    "note": null
  },
  {
    "material": "Papel mezclado (general)",
    "produced": "6.073726868064406",
    "reduced": "-6.073726868064406",
    "recycled": "-3.5455235990647034",
    "landfill": "0.07470296200674445",
    "incinerated": "-0.49102544955381977",
    "composted": null,
    "digested": null,
    "netReduction": "3.620226561",
    "note": "\"papel\"; \"papel_2\"; \"papel_3"
  },
  {
    "material": "Papel mezclado (residencial)",
    "produced": "6.000101956994377",
    "reduced": "-6.000101956994377",
    "recycled": "-3.5455235990647034",
    "landfill": "0.015061573769341717",
    "incinerated": "-0.48873345982261684",
    "composted": null,
    "digested": null,
    "netReduction": "3.560585173",
    "note": null
  },
  {
    "material": "Papel mezclado (oficinas)",
    "produced": "7.365426905783641",
    "reduced": "-7.365426905783641",
    "recycled": "-3.5796025767975275",
    "landfill": "0.11358720066488817",
    "incinerated": "-0.4476947725387802",
    "composted": null,
    "digested": null,
    "netReduction": "3.693189777",
    "note": null
  },
  {
    "material": "Residuos de alimentos",
    "produced": "3.6597480795437827",
    "reduced": "-3.6597480795437827",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Residuos de alimentos (sin carne)",
    "produced": "0.761052089095053",
    "reduced": "-0.761052089095053",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": "materia_organica"
  },
  {
    "material": "Residuos de alimentos (sólo carne)",
    "produced": "15.102290225561314",
    "reduced": "-15.102290225561314",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Carne",
    "produced": "30.086331335538",
    "reduced": "-30.086331335538",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Pollos",
    "produced": "2.4517925725092473",
    "reduced": "-2.4517925725092473",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Granos",
    "produced": "0.6212180420050419",
    "reduced": "-0.6212180420050419",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Pan",
    "produced": "0.6575061385044213",
    "reduced": "-0.6575061385044213",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Frutas y verduras",
    "produced": "0.44108924773101815",
    "reduced": "-0.44108924773101815",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Productos lácteos",
    "produced": "1.7517932330248354",
    "reduced": "-1.7517932330248354",
    "recycled": null,
    "landfill": "0.4974976064225201",
    "incinerated": "-0.13426157065196354",
    "composted": "-0.11558502792840858",
    "digested": "-0.04166706810201283",
    "netReduction": "0.6130826344",
    "note": null
  },
  {
    "material": "Cortes de jardines",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "-0.20051974151841304",
    "incinerated": "-0.16690667116263708",
    "composted": "-0.05356070033552296",
    "digested": "-0.08916093257484684",
    "netReduction": "-0.1469590412",
    "note": null
  },
  {
    "material": "Pasto",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "0.1157487405734986",
    "incinerated": "-0.16690667116263708",
    "composted": "-0.05356070033552296",
    "digested": "0.004597750251882235",
    "netReduction": "0.1693094409",
    "note": null
  },
  {
    "material": "Hojas",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "-0.5338629284197376",
    "incinerated": "-0.16690667116263708",
    "composted": "-0.05356070033552296",
    "digested": "-0.14208180467687503",
    "netReduction": "-0.4803022281",
    "note": null
  },
  {
    "material": "Ramas",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "-0.536062587835046",
    "incinerated": "-0.16690667116263708",
    "composted": "-0.05356070033552296",
    "digested": "-0.2237574261262768",
    "netReduction": "-0.4825018875",
    "note": null
  },
  {
    "material": "HDPE",
    "produced": "1.4192980914359248",
    "reduced": "-1.4192980914359248",
    "recycled": "-0.7584501948193252",
    "landfill": "0.020254519141196047",
    "incinerated": "1.2859190946453891",
    "composted": null,
    "digested": null,
    "netReduction": "0.778704714",
    "note": "pe_rigido, pe_flexible"
  },
  {
    "material": "LDPE",
    "produced": "1.795508578745541",
    "reduced": "-1.795508578745541",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": "1.294118329192256",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "PET",
    "produced": "2.1729152901086737",
    "reduced": "-2.1729152901086737",
    "recycled": "-1.0357206316437553",
    "landfill": "0.020254519141196047",
    "incinerated": "1.2416663572872335",
    "composted": null,
    "digested": null,
    "netReduction": "1.055975151",
    "note": "pet"
  },
  {
    "material": "LLDPE",
    "produced": "1.575798913594386",
    "reduced": "-1.575798913594386",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": "1.2888799293428685",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "PP",
    "produced": "1.5248004300239186",
    "reduced": "-1.5248004300239186",
    "recycled": "-0.7937483912033478",
    "landfill": "0.020254519141196047",
    "incinerated": "1.2887280916660748",
    "composted": null,
    "digested": null,
    "netReduction": "0.8140029103",
    "note": "pp_rigido, pp_flexible"
  },
  {
    "material": "PS",
    "produced": "2.4996318935816175",
    "reduced": "-2.4996318935816175",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": "1.651553194272934",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "PVC",
    "produced": "1.9251482239214053",
    "reduced": "-1.9251482239214053",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": "0.6638632425755793",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Mezcla de plásticos",
    "produced": "1.8734007624310425",
    "reduced": "-1.8734007624310425",
    "recycled": "-0.9255234067519946",
    "landfill": "0.020254519141196047",
    "incinerated": "1.259253983673167",
    "composted": null,
    "digested": null,
    "netReduction": "0.9457779259",
    "note": "ps, zunchos_de_pet, plastico_mixto"
  },
  {
    "material": "PLA",
    "produced": "2.4528916331677815",
    "reduced": "-2.4528916331677815",
    "recycled": null,
    "landfill": "-1.642615109278804",
    "incinerated": "-0.6262894300233282",
    "composted": "-0.08643359395975234",
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Computadores de escritorio",
    "produced": "20.86419600973481",
    "reduced": "-20.86419600973481",
    "recycled": "-1.4868382376024454",
    "landfill": "0.020254519141196047",
    "incinerated": "-0.6589594021146855",
    "composted": null,
    "digested": null,
    "netReduction": "1.507092757",
    "note": null
  },
  {
    "material": "Dispositivos electrónicos portátiles",
    "produced": "29.834297794910995",
    "reduced": "-29.834297794910995",
    "recycled": "-1.0617686307750867",
    "landfill": "0.020254519141196047",
    "incinerated": "0.6541539935737422",
    "composted": null,
    "digested": null,
    "netReduction": "1.08202315",
    "note": "Pilas y Electrónicos"
  },
  {
    "material": "Pantallas planas",
    "produced": "24.194600105982435",
    "reduced": "-24.194600105982435",
    "recycled": "-0.9922702860586269",
    "landfill": "0.020254519141196047",
    "incinerated": "0.02531041529554326",
    "composted": null,
    "digested": null,
    "netReduction": "1.012524805",
    "note": null
  },
  {
    "material": "Pantallas CRT",
    "produced": null,
    "reduced": null,
    "recycled": "-0.5695442489123481",
    "landfill": "0.020254519141196047",
    "incinerated": "0.4486828705364111",
    "composted": null,
    "digested": null,
    "netReduction": "0.5897987681",
    "note": null
  },
  {
    "material": "Periféricos electrónicos",
    "produced": "10.316002191792363",
    "reduced": "-10.316002191792363",
    "recycled": "-0.36434580220643786",
    "landfill": "0.020254519141196047",
    "incinerated": "2.081923239853231",
    "composted": null,
    "digested": null,
    "netReduction": "0.3846003213",
    "note": null
  },
  {
    "material": "Impresoras",
    "produced": "7.646134641229953",
    "reduced": "-7.646134641229953",
    "recycled": "-0.5574237748375712",
    "landfill": "0.020254519141196047",
    "incinerated": "1.1984833170760558",
    "composted": null,
    "digested": null,
    "netReduction": "0.577678294",
    "note": null
  },
  {
    "material": "Mezcla de electrónicos",
    "produced": null,
    "reduced": null,
    "recycled": "-0.7853317195222377",
    "landfill": "0.020254519141196047",
    "incinerated": "0.38688541849235814",
    "composted": null,
    "digested": null,
    "netReduction": "0.8055862387",
    "note": null
  },
  {
    "material": "Latas de aluminio",
    "produced": "4.799452726904927",
    "reduced": "-4.799452726904927",
    "recycled": "-9.127378162105622",
    "landfill": "0.020254519141196047",
    "incinerated": "0.03443222054502572",
    "composted": null,
    "digested": null,
    "netReduction": "9.147632681",
    "note": "latas"
  },
  {
    "material": "Lingotes de aluminio",
    "produced": "7.477284567446883",
    "reduced": "-7.477284567446883",
    "recycled": "-7.203664917822339",
    "landfill": "0.020254519141196047",
    "incinerated": "0.03443222054502572",
    "composted": null,
    "digested": null,
    "netReduction": "7.223919437",
    "note": null
  },
  {
    "material": "Latas de acero",
    "produced": "3.027471662360841",
    "reduced": "-3.027471662360841",
    "recycled": "-1.8320754180112897",
    "landfill": "0.020254519141196047",
    "incinerated": "-1.5909481529405463",
    "composted": null,
    "digested": null,
    "netReduction": "1.852329937",
    "note": "hojalata, laton__kg_"
  },
  {
    "material": "Cable de cobre",
    "produced": "6.721928991959251",
    "reduced": "-6.721928991959251",
    "recycled": "-4.488828491750301",
    "landfill": "0.020254519141196047",
    "incinerated": "0.029687293145218514",
    "composted": null,
    "digested": null,
    "netReduction": "4.509083011",
    "note": null
  },
  {
    "material": "Mezcla de metales",
    "produced": "3.6490566431171434",
    "reduced": "-3.6490566431171434",
    "recycled": "-4.39116067379307",
    "landfill": "0.020254519141196047",
    "incinerated": "-1.020788545487492",
    "composted": null,
    "digested": null,
    "netReduction": "4.411415193",
    "note": "chatarra_ferrosa"
  },
  {
    "material": "Vidrio",
    "produced": "0.530820874316884",
    "reduced": "-0.530820874316884",
    "recycled": "-0.2760901764592596",
    "landfill": "0.020254519141196047",
    "incinerated": "0.02684033670533419",
    "composted": null,
    "digested": null,
    "netReduction": "0.2963446956",
    "note": "vidrio"
  },
  {
    "material": "Hormigón asfáltico",
    "produced": "0.1109365088230227",
    "reduced": "-0.1109365088230227",
    "recycled": "-0.08092983093077562",
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": "0.1011843501",
    "note": null
  },
  {
    "material": "Tejas de asfalto",
    "produced": "0.18994168948972495",
    "reduced": "-0.18994168948972495",
    "recycled": "-0.08987534641693365",
    "landfill": "0.020254519141196047",
    "incinerated": "-0.3546165903179407",
    "composted": null,
    "digested": null,
    "netReduction": "0.1101298656",
    "note": null
  },
  {
    "material": "Alfombras",
    "produced": "3.6831269309259898",
    "reduced": "-3.6831269309259898",
    "recycled": "-2.381600180016837",
    "landfill": "0.020254519141196047",
    "incinerated": "1.0980672100751245",
    "composted": null,
    "digested": null,
    "netReduction": "2.401854699",
    "note": null
  },
  {
    "material": "Ladrillos de arcilla",
    "produced": "0.2668114816487859",
    "reduced": "-0.2668114816487859",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Hormigón",
    "produced": null,
    "reduced": null,
    "recycled": "-0.007991560669099028",
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": "0.02824607981",
    "note": null
  },
  {
    "material": "Madera dimensional",
    "produced": "2.132689449765557",
    "reduced": "-2.132689449765557",
    "recycled": "-2.6613403096280934",
    "landfill": "-0.9234079689171634",
    "incinerated": "-0.5844602823456714",
    "composted": null,
    "digested": null,
    "netReduction": "1.737932341",
    "note": null
  },
  {
    "material": "Tablero de yeso",
    "produced": "0.21543021258138986",
    "reduced": "-0.21543021258138986",
    "recycled": "0.02608665626869755",
    "landfill": "-0.061041329359337294",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": "-0.08712798563",
    "note": null
  },
  {
    "material": "Aislamiento de fibra de vidrio",
    "produced": "0.377296630111613",
    "reduced": "-0.377296630111613",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Cenizas volantes",
    "produced": null,
    "reduced": null,
    "recycled": "-0.8652861836606027",
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": "0.8855407028",
    "note": null
  },
  {
    "material": "Tableros de fibra de densidad media",
    "produced": "2.41370104901453",
    "reduced": "-2.41370104901453",
    "recycled": null,
    "landfill": "-0.8538867821502174",
    "incinerated": "-0.5844602823456714",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Acero estructural",
    "produced": "1.6682402580960147",
    "reduced": "-1.6682402580960147",
    "recycled": "-1.9288102239875635",
    "landfill": "0.020254519141196047",
    "incinerated": null,
    "composted": null,
    "digested": null,
    "netReduction": "1.949064743",
    "note": null
  },
  {
    "material": "Suelos de vinilo",
    "produced": "0.5834375357203866",
    "reduced": "-0.5834375357203866",
    "recycled": null,
    "landfill": "0.020254519141196047",
    "incinerated": "-0.3079745111589992",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Suelos de madera",
    "produced": "4.0293982515941265",
    "reduced": "-4.0293982515941265",
    "recycled": null,
    "landfill": "-0.8592610862888036",
    "incinerated": "-0.7408217072548903",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  },
  {
    "material": "Neumáticos",
    "produced": "4.298811233074533",
    "reduced": "-4.298811233074533",
    "recycled": "-0.37630348405859365",
    "landfill": "0.020254519141196047",
    "incinerated": "0.4998102169986687",
    "composted": null,
    "digested": null,
    "netReduction": "0.3965580032",
    "note": null
  },
  {
    "material": "Mezcla de reciclables",
    "produced": null,
    "reduced": null,
    "recycled": "-2.8532819203159536",
    "landfill": "0.03418577667264002",
    "incinerated": "-0.4246928837734306",
    "composted": null,
    "digested": null,
    "netReduction": "2.887467697",
    "note": null
  },
  {
    "material": "Mezcla orgánica",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "0.1802100201502174",
    "incinerated": "-0.14948571960737767",
    "composted": "-0.08643359395975234",
    "digested": "-0.06381598649686568",
    "netReduction": "0.2666436141",
    "note": null
  },
  {
    "material": "RSU mezclados",
    "produced": null,
    "reduced": null,
    "recycled": null,
    "landfill": "0.30922398376646776",
    "incinerated": "0.009154222804641399",
    "composted": null,
    "digested": null,
    "netReduction": null,
    "note": null
  }
];
