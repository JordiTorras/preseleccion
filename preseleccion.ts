const INFINITO: number = 999999999;
const MAXIMO_TEORICO: number = 500;

enum CodigoNivel {
    Total = 1,
    Mensual = 2,
    Quincenal = 3,
    Semanal = 4,
    Dia = 5,
}

enum CodigoDia {
    Lunes = 1,
    Martes = 2,
    Miercoles = 3,
    Jueves = 4,
    Viernes = 5,
    Sabado = 6,
    Domingo = 7,
    Semanal = 8,
    Quincenal = 9,
    Mensual = 10,
    Total = 11,
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
    cargaMax: any[];
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

// funcion auxiliar
function GetRandom(min = 1, max = 5) {
    return Math.floor(Math.random() * (max - min) + min);
}

// funcion auxiliar
function Comparar(a: any, b: any) {
    if (a > b) return -1;
    if (a < b) return 1;

    return 0;
}

// funcion auxiliar
function NVL(a: any, b: any): any {
    if (a == null) {
        return b;
    } else {
        return a;
    }
}

// funcion auxiliar
function GetIdCarga(nivel: number, fecha: Date): number {
    let id: number = 0;

    if (nivel == CodigoNivel.Dia) {
        id = fecha.getDay() === 0 ? CodigoDia.Domingo : fecha.getDay();
    } else {
        switch (nivel) {
            case CodigoNivel.Total:
                id = CodigoDia.Total;
                break;
            case CodigoNivel.Mensual:
                id = CodigoDia.Mensual;
                break;
            case CodigoNivel.Quincenal:
                id = CodigoDia.Quincenal;
                break;
            case CodigoNivel.Semanal:
                id = CodigoDia.Semanal;
                break;
            default:
                console.error("ERROR GetIdCarga");
                break;
        }
    }

    return id;
}

/*
    Esta función simula un SELECT COUNT(*) de las ordenes de servicio de la sede, obteniendo el 
    número de ordenes de servicio en SITUACION=ABIERTA para el profesional en el periodo dado.

    Contamos hacia atras, es decir si queremos saber el número de Ordenes de la quincena, calculamos las
    ordenes de servicio desde la fecha de la orden de sericio a 15 dias atras. 

*/
function SelectCountOrdenesServicio(nivel: number, idSede: number, fechaHasta: Date): number {
    let carga: number = 0;

    if (nivel == CodigoNivel.Dia) {
        // Por como funciona la clase Date, el igual (==) no se puede hacer como el >= > < <=, sino seria suficiente con
        // restar 0 dias.
        carga = BaseDatos.filter(
            (r) => r.fecha.getTime() == fechaHasta.getTime() && r.id_sede === idSede
        ).length;
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
            case CodigoNivel.Semanal:
                diasARestar = 7;
                break;
            case CodigoNivel.Dia:
                diasARestar = 0;
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

/*
    Esta funcion simula un SELECT MAX() para otener la carga maxima de todas las sedes pera un determinado nivel
*/
function SelectMaxCargaXNivel(sedes: Sede[], nivel: number, fecha: Date): number {
    let sede: Sede[] = [];
    let cargaMax: any;

    // SELECT NVL(MAX(cargaXXX), MAXIMO_TEORICO FROM mto_sedes_cargas WHERE nivel = XXX
    sede = sedes
        .filter((s) => s.cargaMax[GetIdCarga(nivel, fecha)] != null)
        .sort((a, b) =>
            Comparar(a.cargaMax[GetIdCarga(nivel, fecha)], b.cargaMax[GetIdCarga(nivel, fecha)])
        );

    /*
        Si todas la sedes tiene definido NULL para el nivel, por ejemplo "Carga Max Quincenal = NULL"
        entonces asumismos que el tope definido es una constante (500) para poder determinar el % carga
        Como todas las sedes tendran null, al igualar la carga Max a 500 no alteramos el resultado al tener
        todas el mismo valor.
    */
    if (sede[0]?.cargaMax[GetIdCarga(nivel, fecha)]) {
        cargaMax = sede[0].cargaMax[GetIdCarga(nivel, fecha)];
    } else cargaMax = MAXIMO_TEORICO;

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
        cargaMax: [],
    };
    sede.cargaMax[CodigoDia.Lunes] = 2;
    sede.cargaMax[CodigoDia.Martes] = 2;
    sede.cargaMax[CodigoDia.Miercoles] = 2;
    sede.cargaMax[CodigoDia.Jueves] = 2;
    sede.cargaMax[CodigoDia.Viernes] = 2;
    sede.cargaMax[CodigoDia.Sabado] = 0;
    sede.cargaMax[CodigoDia.Domingo] = 0;
    sede.cargaMax[CodigoDia.Semanal] = null;
    sede.cargaMax[CodigoDia.Quincenal] = null;
    sede.cargaMax[CodigoDia.Mensual] = null;
    sede.cargaMax[CodigoDia.Total] = null;

    sedesSeleccionadasEtapa1.push(sede);

    sede = {
        id_sede: 2,
        nombre: "VERDAGUER S.L.",
        carga: INFINITO,
        distancia: GetRandom(),
        cargaMax: [],
    };
    sede.cargaMax[CodigoDia.Lunes] = 2;
    sede.cargaMax[CodigoDia.Martes] = 2;
    sede.cargaMax[CodigoDia.Miercoles] = 0;
    sede.cargaMax[CodigoDia.Jueves] = 2;
    sede.cargaMax[CodigoDia.Viernes] = 2;
    sede.cargaMax[CodigoDia.Sabado] = 3;
    sede.cargaMax[CodigoDia.Domingo] = 3;
    sede.cargaMax[CodigoDia.Semanal] = 10;
    sede.cargaMax[CodigoDia.Quincenal] = null;
    sede.cargaMax[CodigoDia.Mensual] = null;
    sede.cargaMax[CodigoDia.Total] = null;

    sedesSeleccionadasEtapa1.push(sede);

    sede = {
        id_sede: 3,
        nombre: "TALLER ROMA",
        carga: INFINITO,
        distancia: GetRandom(),
        cargaMax: [],
    };

    sede.cargaMax[CodigoDia.Lunes] = null;
    sede.cargaMax[CodigoDia.Martes] = null;
    sede.cargaMax[CodigoDia.Miercoles] = null;
    sede.cargaMax[CodigoDia.Jueves] = null;
    sede.cargaMax[CodigoDia.Viernes] = null;
    sede.cargaMax[CodigoDia.Sabado] = 0;
    sede.cargaMax[CodigoDia.Domingo] = 0;
    sede.cargaMax[CodigoDia.Semanal] = null;
    sede.cargaMax[CodigoDia.Quincenal] = null;
    sede.cargaMax[CodigoDia.Mensual] = null;
    sede.cargaMax[CodigoDia.Total] = null;

    sedesSeleccionadasEtapa1.push(sede);

    return sedesSeleccionadasEtapa1;
}

/*
  nivel: 1=TOTAL, 2=MENSUAL, 3= QUINCENAL, 4=SEMANA, 5=DIARIO
*/
function Etapa2(sedesIn: Sede[], fecha: Date, nivel: number = 1): Sede[] {
    let sedesOut: Sede[] = [];

    //Descartamos aquellas sedes cuya carga de trabamo es 0, ya que al ser 0 no aceptan ordenes de servicio
    sedesOut = DescartarSedesCarga0(sedesIn, fecha, nivel);

    sedesOut = DeterminarPorcentajeCargaXNivel(sedesOut, fecha, nivel);

    return sedesOut;
}

function DescartarSedesCarga0(sedesIn: Sede[], fecha: Date, nivel: number = 1): Sede[] {
    let sedesOut: Sede[];

    /*
        Descartamos aquella sedes que tengan definido carga 0 a nivel Total, Mensual, Quincenal, 
        Semanal o correspondiente al dia de la semana (lunes, martes, ... , domingo)
    */
    sedesOut = sedesIn.filter(
        (s) =>
            NVL(s.cargaMax[GetIdCarga(CodigoNivel.Dia, fecha)], 1) != 0 &&
            NVL(s.cargaMax[GetIdCarga(CodigoNivel.Semanal, fecha)], 1) != 0 &&
            NVL(s.cargaMax[GetIdCarga(CodigoNivel.Quincenal, fecha)], 1) != 0 &&
            NVL(s.cargaMax[GetIdCarga(CodigoNivel.Mensual, fecha)], 1) != 0 &&
            NVL(s.cargaMax[GetIdCarga(CodigoNivel.Total, fecha)], 1) != 0
    );

    return sedesOut;
}

/*
    Nivel 1 - Total
    Nivel 2 - Mensual
    Nivel 3 - Quincenal
    Nivel 4 - Semana
    Nivel 5 - Dia de la semana

    Esta es una función recursiva, empezamos por el nivel de mayor restricción el Total, para cada una de las sedes
    determinamos su % carga.
    Aquellas sedes que superen su max carga definido por el nivel actual, se descartan y procedemos a realizar
    la misma acción con el nivel siguiente Mes > Quincena ... > Dia de la seman
    Con el objetivo de ir eliminando del grupo de sedes inicial aquellas que superan sus limites Totales, Mensuales, Quincenales,
    Semanales o Diarios
*/
function DeterminarPorcentajeCargaXNivel(sedesIn: Sede[], fecha: Date, nivel: number = 1): Sede[] {
    // Si hemos superado el nivel 5 devolvemos la lista de sedes seleccionadas del nivel 5 - Dia
    if (nivel > CodigoNivel.Dia) return sedesIn;

    //console.log("nivel: ", nivel);

    /*
        Para cada una de las sedes determinamos el % carga

    */
    for (const s of sedesIn) {
        let cargaActual: number = 0;
        let cargaMaxNivel: number = 0;

        // Obtenemos la carga Maxima segun el nivel de las caracteristicas de la sede
        cargaMaxNivel = s.cargaMax[GetIdCarga(nivel, fecha)];

        // Si la cagar Maxima definida en el mantenimiento es NULL, signfica que acepta ordenes de servicio infinitas
        // pero no podemos asumir que tiene INFINITAS ordenes de servicio, ya que debe repartirse equitativamente entre
        // el resto de profesionales que si tengan carga maxima definida, por eso lo que se hacemos es asumir que la carga maxima
        // para este profesional es igual a la carga Max de todos los profesionales.
        if (cargaMaxNivel == null) {
            cargaMaxNivel = SelectMaxCargaXNivel(sedesIn, nivel, fecha);
        }

        // Calculamos el número de ordenes de servicio de la sede en función del nivel
        cargaActual = SelectCountOrdenesServicio(nivel, s.id_sede, fecha);

        s.carga = (cargaActual + 1) / cargaMaxNivel;

        //console.log(s.id_sede, "", s.carga, " = (", cargaActual, "+ 1) / ", cargaMaxNivel);
    }

    let sedesOut: Sede[] = [];

    /*
        Una vez hemos determinado la carga de trabajo para todas la sedes
        Seleccionamos aquellas sedes que:
            a) Su % carga sea <= 1, eso significa que no han superado su carga de trabajo
            b) Su Carga Max por nivel es null
    */

    sedesOut = sedesIn.filter(
        (s: Sede) => s.carga <= 1 || s.cargaMax[GetIdCarga(nivel, fecha)] == null
    );

    /*
        Si el resultado de seleccionar solo las desdes que no superan la carga de trabajo o su limite Maximo es NULL es 
        un conjunto vacio, regresamos el grupo de sedes de entrada regresando el array al nivel inferior ya que la seleccion 
        debe realizarse entre estas sedes.

        Si el array no esta vacio, debemos realizar el % de carga de trabajo pero para un nivel superior Total > Mensual > 
        Quincenal > ... > Dia de la semana
    */
    if (sedesOut.length === 0) {
        return sedesIn;
    } else {
        return DeterminarPorcentajeCargaXNivel(sedesOut, fecha, ++nivel);
    }
}

function Etapa3(sedes: Sede[], tipoOrdenacion: CodigoOrdenacion = CodigoOrdenacion.Carga): Sede[] {
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

    //Calculamos el % de carga de cada sede por nivel, Dia, Semana, Quincena, Mes y Total
    sedes = Etapa2(sedes, fecha);

    //Ordenamos el resultado por % carga menor o por distancia menor
    sedes = Etapa3(sedes, CodigoOrdenacion.Carga);

    return sedes;
}

//console.log(preseleccionarSedes());

function AsignarOrdenServicio(fechaOrdenServicio: Date): void {
    const s: Sede = PreseleccionarSedes(fechaOrdenServicio)[0];

    if (s) {
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
    } else {
        console.log("SIN ASIGNAR");
    }
}

function main(numDias: number = 1): void {
    let numOrdenesServicio = 40;

    const hoy = new Date();

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
            "(",
            hoy.toLocaleString("es-ES", { weekday: "long" }),
            ")",
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

main(15);

//cmd> ts-node preseleccion.ts
//cmd> ts-node preseleccion.ts > resultados.txt
