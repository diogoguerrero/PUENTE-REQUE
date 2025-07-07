// Variable para guardar el historial de todos los cálculos
let historial = [];
let miGrafico = null; // Variable para el gráfico

// Función principal que se activa con el botón "Calcular"
function calcular() {
    // Tomamos los números que el usuario escribió
    const longitud = parseFloat(document.getElementById('longitud').value);
    const masa = parseFloat(document.getElementById('masa').value);
    const mantenimiento = parseFloat(document.getElementById('mantenimiento').value);

    // Si falta algún número, mostramos un aviso
    if (isNaN(longitud) || isNaN(masa) || isNaN(mantenimiento)) {
        alert("Por favor, rellena todos los campos con números.");
        return;
    }

    // Usamos la fórmula para calcular el desplazamiento Y
    const Y = 12.8877 + (0.0004744 * longitud) - (0.0003125 * masa) - (0.0036265 * mantenimiento);

    // Decidimos el estado del puente según el resultado
    let estado, color, imagenSrc;
    if (Y <= 10) {
        estado = "Aceptable";
        color = "#28a745"; // Verde
        imagenSrc = "https://i.postimg.cc/tJn4N2S2/bridge-ok.jpg";
    } else if (Y > 10 && Y <= 20) {
        estado = "Crítico";
        color = "#ffc107"; // Naranja
        imagenSrc = "https://i.postimg.cc/B62F0KkH/bridge-critical.jpg";
    } else {
        estado = "Inseguro";
        color = "#dc3545"; // Rojo
        imagenSrc = "https://i.postimg.cc/Gpd2YFw0/bridge-unsafe.jpg";
    }

    // Mostramos los resultados en la página
    document.getElementById('resultado').innerHTML = `Desplazamiento: <strong>${Y.toFixed(2)} mm</strong>`;
    
    const leyenda = document.getElementById('leyenda');
    leyenda.textContent = `Estado: ${estado}`;
    leyenda.style.backgroundColor = color;
    leyenda.style.color = (estado === 'Crítico') ? '#333' : 'white';

    document.getElementById('imagenPuente').src = imagenSrc;

    // Actualizamos el gráfico, el comentario y guardamos en el historial
    actualizarGrafico(longitud, masa, mantenimiento, Y);
    agregarComentarioGPT(Y, estado);
    
    historial.push({
        fecha: new Date().toLocaleString('es-ES'),
        longitud,
        masa,
        mantenimiento,
        desplazamiento: Y.toFixed(2),
        estado
    });
}

// Función para mostrar el gráfico de barras
function actualizarGrafico(longitud, masa, mantenimiento, desplazamiento) {
    const ctx = document.getElementById('grafico').getContext('2d');
    
    if (miGrafico) {
        miGrafico.destroy(); // Borramos el gráfico anterior para dibujar el nuevo
    }

    miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Longitud', 'Masa', 'Mantenimiento', 'Desplazamiento'],
            datasets: [{
                label: 'Valores',
                data: [longitud, masa, mantenimiento, desplazamiento],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ]
            }]
        },
        options: {
            plugins: { legend: { display: false } }, // Ocultamos la leyenda del gráfico
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Función que genera el comentario "inteligente"
function agregarComentarioGPT(valorY, estado) {
    let comentario = "";
    if (estado === "Aceptable") {
        comentario = `El resultado de <strong>${valorY.toFixed(2)} mm</strong> es <strong>excelente</strong>. Indica que la estructura del puente es estable y segura bajo las condiciones actuales. No se necesitan acciones urgentes.`;
    } else if (estado === "Crítico") {
        comentario = `<strong>Atención:</strong> El desplazamiento de <strong>${valorY.toFixed(2)} mm</strong> sugiere un nivel de estrés considerable. Se recomienda planificar una inspección técnica para evitar problemas mayores a futuro.`;
    } else {
        comentario = `<strong>¡Alerta Máxima!</strong> Un desplazamiento de <strong>${valorY.toFixed(2)} mm</strong> supera los límites de seguridad. Es crucial realizar una inspección <strong>inmediata</strong> y considerar restricciones de uso en el puente.`;
    }
    document.getElementById('comentarioGPT').innerHTML = comentario;
}

// Función para cambiar entre modo claro y oscuro
function alternarModo() {
    document.body.classList.toggle('modo-oscuro');
    const boton = document.querySelector('.controles button');
    if (document.body.classList.contains('modo-oscuro')) {
        boton.innerHTML = '☀️ Activar Modo Claro';
    } else {
        boton.innerHTML = '🌙 Activar Modo Oscuro';
    }
}

// Función para guardar el historial en un archivo
function exportarCSV() {
    if (historial.length === 0) {
        alert("Aún no has hecho ningún cálculo para guardar.");
        return;
    }

    let csvContent = "Fecha,Longitud(m),Masa(kg/m),Mantenimiento(%),Desplazamiento(mm),Estado\n";
    historial.forEach(fila => {
        csvContent += `${fila.fecha},${fila.longitud},${fila.masa},${fila.mantenimiento},${fila.desplazamiento},${fila.estado}\n`;
    });

    // Creamos un archivo "invisible" para descargarlo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historial_puentes.csv";
    link.click();
}