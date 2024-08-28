import { Request, Response } from 'express';
import axios from 'axios';
import connection from '../config/database';
import { validateImageData, checkExistingMeasure } from '../utils/validation';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    const validationError = validateImageData(image, customer_code, measure_datetime, measure_type);

    if (validationError) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validationError
      });
    }

    const existingMeasure = await checkExistingMeasure(customer_code, measure_type, measure_datetime);
    if (existingMeasure) {
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: "Leitura do mês já realizada"
      });
    }

    const response = await axios.post('https://api.gemini.com/vision', {
      image
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      }
    });

    const { image_url, measure_value, measure_uuid } = response.data;

    const sql = 'INSERT INTO measures (image_url, measure_value, measure_uuid, customer_code, measure_datetime, measure_type) VALUES (?, ?, ?, ?, ?, ?)';
    await connection.query(sql, [image_url, measure_value, measure_uuid, customer_code, measure_datetime, measure_type]);

    res.status(200).json({
      image_url,
      measure_value,
      measure_uuid
    });

  } catch (error) {
    res.status(500).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Erro ao processar a solicitação"
    });
  }
};

export const confirmMeasure = async (req: Request, res: Response) => {
  const { measure_uuid, confirmed_value } = req.body;

  if (!measure_uuid || confirmed_value == null) {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Dados fornecidos são inválidos'
    });
  }

  try {
    const [results]: [any[], any] = await connection.query('SELECT * FROM measures WHERE measure_uuid = ?', [measure_uuid]);

    if (results.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada'
      });
    }

    const measure = results[0];

    if (measure.confirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura já confirmada'
      });
    }

    await connection.query('UPDATE measures SET measure_value = ?, confirmed = TRUE WHERE measure_uuid = ?', [confirmed_value, measure_uuid]);

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({
      error_code: 'INTERNAL_ERROR',
      error_description: 'Erro ao atualizar a medição'
    });
  }
};

export const listMeasures = async (req: Request, res: Response) => {
  const { customer_code } = req.params;
  const { measure_type } = req.query;

  if (measure_type && !['WATER', 'GAS'].includes(String(measure_type).toUpperCase())) {
    return res.status(400).json({
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida'
    });
  }

  try {
    let sql = 'SELECT * FROM measures WHERE customer_code = ?';
    const queryParams: any[] = [customer_code];

    if (measure_type) {
      sql += ' AND measure_type = ?';
      queryParams.push(String(measure_type).toUpperCase());
    }

    const [results]: [any[], any] = await connection.query(sql, queryParams);

    if (results.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada'
      });
    }

    res.status(200).json({
      customer_code,
      measures: results.map(measure => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type,
        has_confirmed: measure.confirmed,
        image_url: measure.image_url
      }))
    });

  } catch (error) {
    res.status(500).json({
      error_code: 'INTERNAL_ERROR',
      error_description: 'Erro ao buscar as medições'
    });
  }
};
