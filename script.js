document.getElementById("calcularBtn").addEventListener("click", () => {

    // === LEER DATOS ===
    const g = (id) => parseFloat(document.getElementById(id).value) || 0;

    const datosGlobales = {
        costoMaterial: g("costo_material"),
        tiempoCiclo: g("tiempo_ciclo"),
        empleados: g("num_empleados"),
        horasTurno: g("horas_turno"),
        gastosFijos: g("gastos_fijos"),
        diasOperativos: g("dias_operativos"),
        costoMaquinaria: g("costo_maquinaria"),
        margen: g("porcentaje_margen"),
        tasaInteres: g("tasa_interes"),
        unidadesEnvio: g("unidades_envio")
    };

    // Escenario China
    const china = {
        nombre: "China (Shenzhen)",
        salarioHora: g("salario_china"),
        costoEnvio: g("flete_china"),
        arancel: g("arancel_china"),
        diasTransito: g("dias_china")
    };

    // Escenario México (fijos)
    const mexico = {
        nombre: "México (Nearshoring)",
        salarioHora: 3.8,
        costoEnvio: 800,
        arancel: 0,
        diasTransito: 1
    };

    // === FUNCIÓN PRINCIPAL ===
    function calcularPais(p, global) {

        const tc = global.tiempoCiclo <= 0 ? 1 : global.tiempoCiclo;
        const unidadesHora = 60 / tc;
        const unidadesDia = unidadesHora * global.horasTurno;
        const produccionAnual = unidadesDia * global.diasOperativos;

        const nominaDiaria = global.empleados * global.horasTurno * p.salarioHora;
        const cpuLabor = nominaDiaria / unidadesDia;
        const cpuFijos = (global.gastosFijos / 30) / unidadesDia;

        const exWorks = global.costoMaterial + cpuLabor + cpuFijos;
        const logistica = p.costoEnvio / global.unidadesEnvio;
        const aranceles = exWorks * (p.arancel / 100);
        const financiero = exWorks * (global.tasaInteres / 100 / 365) * p.diasTransito;

        const landedCost = exWorks + logistica + aranceles + financiero;

        const precioVenta = landedCost * (1 + global.margen / 100);
        const utilidadUnit = precioVenta - landedCost;
        const utilidadAnual = utilidadUnit * produccionAnual;

        let roi = 0;
        let meses = 0;

        if (global.costoMaquinaria > 0 && utilidadAnual > 0) {
            roi = (utilidadAnual / global.costoMaquinaria) * 100;
            meses = (global.costoMaquinaria / utilidadAnual) * 12;
        }

        return {
            exWorks, logistica, aranceles, financiero,
            landedCost, precioVenta, utilidadUnit,
            utilidadAnual, roi, meses
        };
    }

    const rChina = calcularPais(china, datosGlobales);
    const rMexico = calcularPais(mexico, datosGlobales);

    const ahorroPrecio = rChina.precioVenta - rMexico.precioVenta;

    // === IMPRIMIR RESULTADOS ===
    document.getElementById("resultados").innerHTML = `
        <h2>Resultados de Comparativa</h2>

        <h3>1. Costos Unitarios (USD)</h3>
        <table>
            <tr><th>Concepto</th><th>China</th><th>México</th></tr>
            <tr><td>ExWorks</td><td>${rChina.exWorks.toFixed(2)}</td><td>${rMexico.exWorks.toFixed(2)}</td></tr>
            <tr><td>Logística</td><td>${rChina.logistica.toFixed(2)}</td><td>${rMexico.logistica.toFixed(2)}</td></tr>
            <tr><td>Aranceles</td><td>${rChina.aranceles.toFixed(2)}</td><td>${rMexico.aranceles.toFixed(2)}</td></tr>
            <tr><td>Financiero</td><td>${rChina.financiero.toFixed(2)}</td><td>${rMexico.financiero.toFixed(2)}</td></tr>
            <tr class="highlight"><td>Landed Cost</td><td>${rChina.landedCost.toFixed(2)}</td><td>${rMexico.landedCost.toFixed(2)}</td></tr>
        </table>

        <h3>2. Precio Sugerido (Margen del ${datosGlobales.margen}%)</h3>
        <table>
            <tr><th>Concepto</th><th>China</th><th>México</th></tr>
            <tr><td>Precio Venta</td><td>${rChina.precioVenta.toFixed(2)}</td><td>${rMexico.precioVenta.toFixed(2)}</td></tr>
            <tr><td>Utilidad / unidad</td><td>${rChina.utilidadUnit.toFixed(2)}</td><td>${rMexico.utilidadUnit.toFixed(2)}</td></tr>
        </table>

        <p><b>El producto hecho en México permite vender ${ahorroPrecio.toFixed(2)} USD más barato manteniendo margen.</b></p>

        <h3>3. ROI (Basado en utilidad anual)</h3>
        <p><b>China:</b> ROI ${rChina.roi.toFixed(0)}% — Recuperación: ${rChina.meses.toFixed(1)} meses</p>
        <p><b>México:</b> ROI ${rMexico.roi.toFixed(0)}% — Recuperación: ${rMexico.meses.toFixed(1)} meses</p>
    `;
});