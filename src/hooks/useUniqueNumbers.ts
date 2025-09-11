export function generarNumerosAleatoriosUnicos(min: number, max: number, cantidad: number) {
    if (cantidad > max - min + 1) {
        throw new Error('La cantidad de números únicos no puede ser mayor que el rango de números posibles');
    }

    // Crear un array con todos los números en el rango
    const numeros = Array.from({ length: max - min + 1 }, (_) => {
        const number = (Math.random() * (max - min) + min).toFixed(8);
        return parseFloat(number);
    });

    // Eliminar duplicados
    const numerosUnicos = [...new Set(numeros)];

    // Si la cantidad solicitada es mayor que la cantidad de números únicos disponibles,
    // entonces lanzar un error
    if (cantidad > numerosUnicos.length) {
        throw new Error('La cantidad de números únicos solicitada es mayor que la cantidad de números únicos disponibles');
    }

    // Tomar los primeros 'cantidad' elementos de la lista mezclada
    return numerosUnicos.slice(0, cantidad);
}