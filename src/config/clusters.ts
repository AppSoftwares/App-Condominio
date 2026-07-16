export const RESIDENTIAL_CLUSTERS = {
  "Etapa I": [
    "Conjunto 01 Sinamaica",
    "Conjunto 02 Mucubají",
    "Conjunto 03 Tacarigua",
    "Conjunto 04 Canaima",
    "Conjunto 05 Punta Mangle",
    "Conjunto 06 Las Palmas",
    "Conjunto 07 Las Piedas",
    "Conjunto 08 Restinga"
  ],
  "Etapa II": [
    "Conjunto 09 Los Olivitos",
    "Conjunto 10 Las Isleta",
    "Conjunto 11 La Restinga"
  ],
  "Etapa III": [
    "Conjunto 10 Espejo",
    "Conjunto 11 Punta de Piedra",
    "Conjunto 12 Las Garzas",
    "Conjunto 13 Los Cedros",
    "Conjunto 14 Las Huertas",
    "Conjunto 15 El Rosal",
    "Conjunto 16 Yacambú",
    "Conjunto 17 La Estrella",
    "Conjunto 18 Las Coloradas",
    "Conjunto 19 Punta Delgado",
    "Conjunto 20 Las Mellizas",
    "Conjunto 21 Dos Cerritos",
    "Conjunto 22 El Rincón",
    "Conjunto 23 La Estrella"
  ]
};

export const getEtapaForCluster = (clusterName: string): string => {
  for (const [etapa, conjuntos] of Object.entries(RESIDENTIAL_CLUSTERS)) {
    if (conjuntos.includes(clusterName)) return etapa;
  }
  return "Etapa III"; // Default
};
