import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PythonPredictResponse } from '../interfaces/prediction.interface';

@Injectable()
export class PythonApiService {
  private readonly logger = new Logger(PythonApiService.name);
  private readonly pythonUrl: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('PYTHON_URL');
    if (!url) {
      throw new Error('PYTHON_URL is not defined in environment variables');
    }
    this.pythonUrl = url;
    this.logger.log(`Python API URL: ${this.pythonUrl}`);
  }

  async predictSingleImage(
    base64Image: string,
  ): Promise<PythonPredictResponse> {
    try {
      this.logger.log('Calling Python API for image classification...');

      const response = await fetch(`${this.pythonUrl}/api/predict/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(
          `Python API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
        throw new HttpException(
          {
            status: 'failed',
            message: 'Failed to classify image',
            error: errorData,
          },
          response.status,
        );
      }

      const data: PythonPredictResponse = await response.json();
      this.logger.log(
        `Classification successful: ${data.data.class} (${(data.data.confidence * 100).toFixed(2)}%)`,
      );

      return data;
    } catch (error) {
      this.logger.error(`Error calling Python API: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'failed',
          message: 'Failed to connect to Python prediction service',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.pythonUrl}/health`);
      return response.ok;
    } catch (error) {
      this.logger.error(`Python API health check failed: ${error.message}`);
      return false;
    }
  }
}
