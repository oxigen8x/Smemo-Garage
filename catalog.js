/* Catalogo di ESEMPIO (marca > modello > [versione, da, a|0=in produzione]). Da completare con dati verificati. */
const CATALOG = {
  auto: {
    Fiat: { Panda: [['0.9 TwinAir 85 CV',2012,2020],['1.2 69 CV',2012,2020],['1.0 FireFly Hybrid 70 CV',2020,0]],
            '500': [['1.2 69 CV',2007,2020],['0.9 TwinAir 85 CV',2010,2020],['Elettrica 118 CV',2020,0]],
            Tipo: [['1.4 95 CV',2016,0],['1.6 Multijet 120 CV',2016,2023],['1.0 T3 100 CV',2020,0]] },
    Volkswagen: { Golf: [['1.6 TDI 105 CV',2012,2019],['2.0 TDI 150 CV',2013,2020],['1.0 eTSI 110 CV',2020,0]],
            Polo: [['1.0 MPI 80 CV',2017,0],['1.0 TSI 95 CV',2017,0],['1.6 TDI 80 CV',2017,2021]],
            Tiguan: [['2.0 TDI 150 CV',2016,0],['1.5 TSI 150 CV',2019,0]] },
    Toyota: { Yaris: [['1.5 Hybrid 116 CV',2020,0],['1.0 VVT-i 72 CV',2020,0]],
            Corolla: [['1.8 Hybrid 122 CV',2019,0],['2.0 Hybrid 196 CV',2019,0]],
            'Aygo X': [['1.0 VVT-i 72 CV',2022,0]] },
    Peugeot: { '208': [['1.2 PureTech 75 CV',2019,0],['1.2 PureTech 100 CV',2019,0],['e-208 136 CV',2019,0]],
            '308': [['1.2 PureTech 130 CV',2021,0],['1.5 BlueHDi 130 CV',2021,0]],
            '2008': [['1.2 PureTech 130 CV',2019,0],['1.5 BlueHDi 110 CV',2019,0]] },
    Renault: { Clio: [['1.0 TCe 90 CV',2019,0],['1.5 Blue dCi 85 CV',2019,0]],
            Captur: [['1.0 TCe 90 CV',2020,0],['1.6 E-Tech Hybrid 145 CV',2020,0]],
            Megane: [['1.5 dCi 110 CV',2016,2022],['1.3 TCe 140 CV',2018,2022]] },
    BMW: { 'Serie 1': [['116d 116 CV',2019,0],['118i 140 CV',2019,0]],
            'Serie 3': [['318d 150 CV',2019,0],['320d 190 CV',2019,0]],
            X1: [['sDrive18i 136 CV',2022,0],['sDrive18d 150 CV',2022,0]] },
    Audi: { A3: [['30 TFSI 110 CV',2020,0],['35 TDI 150 CV',2020,0]],
            A4: [['35 TDI 163 CV',2019,0],['40 TFSI 204 CV',2019,0]],
            Q3: [['35 TFSI 150 CV',2018,0],['35 TDI 150 CV',2018,0]] },
    Ford: { Fiesta: [['1.1 85 CV',2017,2023],['1.0 EcoBoost 100 CV',2017,2023]],
            Focus: [['1.0 EcoBoost 125 CV',2018,0],['1.5 EcoBlue 120 CV',2018,0]],
            Puma: [['1.0 EcoBoost Hybrid 125 CV',2019,0],['1.0 EcoBoost Hybrid 155 CV',2019,0]] },
    Lancia: { Ypsilon: [['1.2 69 CV',2011,2024],['1.0 FireFly Hybrid 70 CV',2021,2024]] },
    Dacia: { Sandero: [['1.0 TCe 90 CV',2020,0],['1.0 ECO-G 100 CV',2020,0]],
            Duster: [['1.5 Blue dCi 115 CV',2018,2023]] }
  },
  moto: {
    Honda: { CB650R: [['649 cc 95 CV',2019,0]], 'Transalp XL750': [['755 cc 92 CV',2023,0]],
             SH125i: [['125 cc 13 CV',2020,0],['125 cc 12 CV',2013,2019]] },
    Yamaha: { 'MT-07': [['689 cc 73 CV',2018,0]], 'Tracer 7': [['689 cc 73 CV',2021,0]],
             'T-Max': [['560 cc 47 CV',2020,0],['530 cc 38 CV',2012,2019]] },
    Ducati: { Monster: [['937 cc 111 CV',2021,0]], 'Multistrada V2': [['937 cc 113 CV',2022,0]] },
    BMW: { 'R 1250 GS': [['1254 cc 136 CV',2019,0]], 'F 900 R': [['895 cc 105 CV',2020,0]] },
    Vespa: { Primavera: [['125 cc 11 CV',2013,0],['50 cc 4 CV',2013,0]], GTS: [['300 cc 24 CV',2019,0]] }
  }
};