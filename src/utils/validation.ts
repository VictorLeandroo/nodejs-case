import connection from '../config/database';

export const validateImageData = (image: string, customer_code: string, measure_datetime: string, measure_type: string) => {
    if (!image || typeof image !== 'string' || !/^data:image\/(png|jpeg|jpg);base64,/.test(image)) {
        return 'O campo "image" deve ser uma string base64 de uma imagem.';
    }

    if (!customer_code || typeof customer_code !== 'string') {
        return 'O campo "customer_code" deve ser uma string.';
    }

    if (!measure_datetime || isNaN(Date.parse(measure_datetime))) {
        return 'O campo "measure_datetime" deve ser uma data válida.';
    }

    const validMeasureTypes = ['WATER', 'GAS'];
    if (!measure_type || !validMeasureTypes.includes(measure_type.toUpperCase())) {
        return 'O campo "measure_type" deve ser "WATER" ou "GAS".';
    }

    return null;
};

interface Measure {
    measure_uuid: string;
    customer_code: string;
    measure_type: string;
    measure_datetime: Date;
    has_confirmed: boolean;
    image_url: string;
}

export const checkExistingMeasure = async (customer_code: string, measure_type: string, measure_datetime: string): Promise<boolean> => {
    try {
        const [results] = await connection.query('SELECT * FROM measures WHERE customer_code = ? AND measure_type = ? AND YEAR(measure_datetime) = YEAR(?) AND MONTH(measure_datetime) = MONTH(?)', [customer_code, measure_type, measure_datetime, measure_datetime]);

        return Array.isArray(results) && results.length > 0;
    } catch (error) {
        throw error;
    }
}

export const validateConfirmMeasureData = (measure_uuid: string, confirmed_value: number) => {
    if (!measure_uuid || typeof measure_uuid !== 'string') {
        return 'O campo "measure_uuid" deve ser uma string.';
    }

    if (confirmed_value == null || typeof confirmed_value !== 'number') {
        return 'O campo "confirmed_value" deve ser um número.';
    }

    return null;
};
