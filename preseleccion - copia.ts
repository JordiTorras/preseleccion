const INFINITO: number = 999999999;
const MAXIMO_TEORICO: number = 500;

enum CodigoNivel {
    Total = 1,
    Mensual = 2,
    Quincenal = 3,
    semanal = 4,
    dia = 5,
}

enum CodigoDia {
    Lunes = 1,
    Martes = 2,
    Miercoles = 3,
    Jueves = 4,
    Viernes = 5,
    Sabado = 6,
    Domingo = 7,
}

enum CodigoOrdenacion {
    Carga = "CARGA",
    Proximidad = "PROXIMIDAD",
}

type Sede = {
    id_sede: number;
    nombre: string;
    carga: number;
    distancia: number;
    cargaMaxDiaria: number[];
    cargaMaxSemanal: number | null;
    cargaMaxQuincenal: number | null;
    cargaMaxMensual: number | null;
    cargaMaxTotal: number | null;
};

type BDD = {
    id: number;
    fecha: Date;
    id_sede: number;
    nombre: string;
    carga: number;
    distancia: number;
};
var sequenciaIdBdd: number = 0;

var BaseDatos: BDD[] = [];

function GetRandom(min = 1, max = 5) {
    return Math.floor(Math.random() * (max - min) + min);
}

function Comparar(a: any, b: any) {
    if (a > b) return -1;
    if (a < b) return 1;

    return 0;
}

function SelectCountOrdenesServicio(nivel: number, idSede: number, fechaHasta: Date): number {
    let carga: number = 0;

    if (nivel == CodigoNivel.dia) {
    } else {
        let diasARestar: number = 0;
        switch (nivel) {
            case CodigoNivel.Total:
                diasARestar = 365 * 2;
                break;
            case CodigoNivel.Mensual:
                diasARestar = 30;
                break;
            case CodigoNivel.Quincenal:
                diasARestar = 15;
                break;
            case CodigoNivel.semanal:
                diasARestar = 7;
                break;
            default:
                diasARestar = 0;
                console.error("ERROR SelectCountOrdenesServicio");
                break;
        }
        let fechaDesde = new Date();
        fechaDesde.setDate(fechaHasta.getDate() - diasARestar);

        // SELECT COUNT(*) FROM ordenes_servico WHERE fecha_orden_servicio BETWEEN fechaDesde AND fechaHasta
        carga = BaseDatos.filter(
            (r) => r.fecha > fechaDesde && r.fecha <= fechaHasta && r.id_sede === idSede
        ).length;
    }

    return carga;
}

function SelectMaxCargaXNivel(sedes: Sede[], nivel: number): number {
    let sede: Sede[] = [];
    let cargaMax: any;

    if (nivel == CodigoNivel.dia) {
    } else {
        switch (nivel) {
            case CodigoNivel.Total:
                // SELECT NVL(MAX(cargaX), MAXIMO_TEORICO) FROM mantenimiento_sede WHERE cargaX IS NOT NULL
                sede = sedes
                    .filter((s) => s.cargaMaxTotal != null)
                    .sort((a, b) => Comparar(a.cargaMaxTotal, b.cargaMaxTotal));

                if (sede[0]?.cargaMaxTotal) {
                    cargaMax = sede[0].cargaMaxTotal;
                } else cargaMax = MAXIMO_TEORICO;

                break;
            case CodigoNivel.Mensual:
                sede = sedes
                    .filter((s) => s.cargaMaxMensual != null)
                    .sort((a, b) => Comparar(a.cargaMaxMensual, b.cargaMaxMensual));

                if (sede[0]?.cargaMaxMensual) {
                    cargaMax = sede[0].cargaMaxMensual;
                } else cargaMax = MAXIMO_TEORICO;

                break;
            case CodigoNivel.Quincenal:
                sede = sedes
                    .filter((s) => s.cargaMaxQuincenal != null)
                    .sort((a, b) => Comparar(a.cargaMaxQuincenal, b.cargaMaxQuincenal));

                if (sede[0]?.cargaMaxQuincenal) {
                    cargaMax = sede[0].cargaMaxQuincenal;
                } else cargaMax = MAXIMO_TEORICO;

                break;
            case CodigoNivel.semanal:
                sede = sedes
                    .filter((s) => s.cargaMaxSemanal != null)
                    .sort((a, b) => Comparar(a.cargaMaxSemanal, b.cargaMaxSemanal));

                if (sede[0]?.cargaMaxSemanal) {
                    cargaMax = sede[0].cargaMaxSemanal;
                } else cargaMax = MAXIMO_TEORICO;

                break;

            default:
                cargaMax = 0;
                console.error("ERROR SelectMaxCargaXNivel");
                break;
        }
    }

    return cargaMax;
}

// Simula la Etapa 1 del algoritmo, busca las sedes seleccionables
function Etapa1(): Sede[] {
    let sedesSeleccionadasEtapa1: Sede[] = [];
    let sede: Sede = {
        id_sede: 1,
        nombre: "TALLERES TORRAS",
        carga: INFINITO,
        distancia: GetRandom(),
        cargaMaxDiaria: [2, 2, 2, 2, 2, 2, 2],
        cargaMaxSemanal: 2,
        cargaMaxQuincenal: 8,
        cargaMaxMensual: null,
        cargaMaxTotal: null,
    };

    sedesSeleccionadasEtapa1.push(sede);

    sede = {
        id_sede: 2,
        nombre: "VERDAGUER S.L.",
        carga: INFINITO,
        distancia: GetRandom(),
        cargaMaxDiaria: [1, 1, 1, 1, 1, 1, 1],
        cargaMaxSemanal: 4,
        cargaMaxQuincenal: 4,
        cargaMaxMensual: null,
        cargaMaxTotal: null,
    };

    sedesSeleccionadasEtapa1.push(sede);

    sede = {
        id_sede: 3,
        nombre: "TALLER ROMA",
        carga: INFINITO,
        distancia: GetRandom(),
        cargaMaxDiaria: [1, 1, 1, 1, 1, 1, 1],
        cargaMaxSemanal: null,
        cargaMaxQuincenal: null,
        cargaMaxMensual: null,
        cargaMaxTotal: null,
    };

    sedesSeleccionadasEtapa1.push(sede);

    return sedesSeleccionadasEtapa1;
}

/*
  nivel: 1=GLOBAL, 2=MENSUAL, 3= QUINCENAL, 4=SEMANA, 5=DIARIO
  */
function Etapa2(sedesIn: Sede[], fecha: Date, nivel: number = 1): Sede[] {
    // Si hemos superado el nivel 5 devolvemos la lista de sedes seleccionadas del nivel 5 - Dia
    if (nivel > 4) return sedesIn;

    console.log("nivel: ", nivel);

    for (const s of sedesIn) {
        let cargaActual: number = SelectCountOrdenesServicio(nivel, s.id_sede, fecha);
        let cargaMaxNivel: any = 0;

        switch (nivel) {
            case CodigoNivel.Total:
                cargaMaxNivel = s.cargaMaxTotal;
                break;
            case CodigoNivel.Mensual:
                cargaMaxNivel = s.cargaMaxMensual;
                break;
            case CodigoNivel.Quincenal:
                cargaMaxNivel = s.cargaMaxQuincenal;
                break;
            case CodigoNivel.semanal:
                cargaMaxNivel = s.cargaMaxSemanal;
                break;
            default:
                console.error("ERROR Etapa2");
                break;
        }

        if (cargaMaxNivel == null) {
            cargaMaxNivel = SelectMaxCargaXNivel(sedesIn, nivel);
        }
        s.carga = (cargaActual + 1) / cargaMaxNivel;

        //console.log(s.id_sede, "", s.carga, " = (", cargaActual, "+ 1) / ", cargaMaxNivel);
    }

    let sedesOut: Sede[] = [];

    switch (nivel) {
        case CodigoNivel.Total:
            sedesOut = sedesIn.filter((s: Sede) => s.carga <= 1 || s.cargaMaxTotal == null);
            break;
        case CodigoNivel.Mensual:
            sedesOut = sedesIn.filter((s: Sede) => s.carga <= 1 || s.cargaMaxMensual == null);
            break;
        case CodigoNivel.Quincenal:
            sedesOut = sedesIn.filter((s: Sede) => s.carga <= 1 || s.cargaMaxQuincenal == null);
            break;
        case CodigoNivel.semanal:
            sedesOut = sedesIn.filter((s: Sede) => s.carga <= 1 || s.cargaMaxSemanal == null);
            break;
        default:
            console.error("ERROR Etapa2");
            break;
    }

    if (sedesOut.length === 0) {
        console.log("return sedeIn");
        return sedesIn;
    } else {
        console.log("return Etapa2 ", nivel + 1);
        return Etapa2(sedesOut, fecha, ++nivel);
    }
}

function Etapa3(sedes: Sede[], tipoOrdenacion: CodigoOrdenacion): Sede[] {
    switch (tipoOrdenacion) {
        case CodigoOrdenacion.Proximidad:
            sedes.sort((a: Sede, b: Sede) => a.distancia - b.distancia);
            break;
        case CodigoOrdenacion.Carga:
            sedes.sort((a: Sede, b: Sede) => a.carga - b.carga);
            break;
        default:
            break;
    }

    return sedes;
}

function PreseleccionarSedes(fecha: Date): Sede[] {
    let sedes: Sede[] = [];

    //Seleccionamos las sedes vigentes, esta fase devuelve el conjunto de sedes posibles, vigentes, rol y subrol, por zona geografica, caracteristicas del siniestro
    //para cada tambien se obtiene la distancia de la sede con la dirección de la ubicación
    sedes = Etapa1();

    sedes = Etapa2(sedes, fecha);

    sedes = Etapa3(sedes, CodigoOrdenacion.Carga);

    return sedes;
}

//console.log(preseleccionarSedes());

function AsignarOrdenServicio(fechaOrdenServicio: Date): void {
    const s: Sede = PreseleccionarSedes(fechaOrdenServicio)[0];

    BaseDatos.push({
        id: ++sequenciaIdBdd,
        fecha: new Date(fechaOrdenServicio),
        id_sede: s.id_sede,
        nombre: s.nombre,
        carga: s.carga,
        distancia: s.distancia,
    });

    BaseDatos.filter((r) => r.id == sequenciaIdBdd).forEach((r) =>
        console.log(r.id, " ", r.fecha, " ", r.nombre, " ", r.carga)
    );
}

function main(numDias: number = 1): void {
    let numOrdenesServicio = 40;

    const hoy = new Date();
    //console.log(hoy.getFullYear() + "/" + (hoy.getMonth() + 1) + "/" + hoy.getDate());

    //console.log(hoy.getDay() === 0 ? 7 : hoy.getDay());

    for (let d = 1; d <= numDias; d++) {
        numOrdenesServicio = GetRandom(0, 7);
        //numOrdenesServicio = 6;
        console.info("");
        console.info("=".repeat(80));
        console.info(
            "#",
            d,
            "Dia:",
            hoy.getFullYear() + "/" + (hoy.getMonth() + 1) + "/" + hoy.getDate(),
            " ordenes de servicio: ",
            numOrdenesServicio
        );
        console.info("=".repeat(80));
        for (let i = 0; i < numOrdenesServicio; i++) {
            AsignarOrdenServicio(hoy);
        }

        /* BaseDatos.filter((r) => r.fecha.getTime() == hoy.getTime()).forEach((r) =>
            console.log(r.id, " ", r.fecha, " ", r.nombre, " ", r.carga)
        ); */

        hoy.setDate(hoy.getDate() + 1);
    }
}

main(20);
