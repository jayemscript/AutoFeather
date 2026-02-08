import { Injectable, Logger } from '@nestjs/common';
import { SocketService } from 'src/modules/sockets/socket.service';
import axios from 'axios';

export interface TemperatureData {
  temperature: number;
  timestamp: Date;
  sensorId: string;
  unit: string;
}

export interface HumidityData {
  humidity: number;
  timestamp: Date;
  sensorId: string;
  unit: string;
}

@Injectable()
export class TemperatureSensorService {
  private readonly logger = new Logger(TemperatureSensorService.name);
  private latestRaspberryPiData: TemperatureData | null = null;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private isBroadcasting = false;
  private readonly fastApiUrl = 'http://localhost:5000';

  constructor(private readonly socketService: SocketService) {}

  handleTemperatureFromRaspberryPi(payload: any) {
    if (payload.status !== 'success' || !payload.data) {
      this.logger.warn('Received invalid data from Raspberry Pi');
      return { status: 'error', message: 'Invalid data format' };
    }

    const data: TemperatureData = {
      temperature: payload.data.temperature,
      timestamp: new Date(payload.data.timestamp),
      sensorId: payload.data.sensorId,
      unit: payload.data.unit,
    };

    this.latestRaspberryPiData = data;

    this.logger.log(
      `Raspberry Pi temperature: ${data.temperature}°C from ${data.sensorId}`,
    );

    this.socketService.broadcast('sensor:temperature', data);

    return { status: 'received' };
  }

  async startTemperatureSimulation(intervalMs = 3000) {
    if (this.isBroadcasting) {
      this.logger.warn('Temperature broadcasting is already running');
      return { message: 'Broadcasting already running' };
    }

    this.isBroadcasting = true;
    this.logger.log(
      `Starting temperature broadcasting (interval: ${intervalMs}ms)`,
    );

    await this.fetchAndBroadcastTemperature();

    this.broadcastInterval = setInterval(async () => {
      await this.fetchAndBroadcastTemperature();
    }, intervalMs);

    return {
      message: 'Temperature broadcasting started',
      interval: intervalMs,
    };
  }

  stopTemperatureSimulation() {
    if (!this.isBroadcasting) {
      this.logger.warn('No broadcasting is currently running');
      return { message: 'No broadcasting running' };
    }

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    this.isBroadcasting = false;
    this.logger.log('Temperature broadcasting stopped');

    return { message: 'Temperature broadcasting stopped' };
  }

  private async fetchAndBroadcastTemperature() {
    try {
      const response = await axios.get(`${this.fastApiUrl}/sensor/temp`);
      
      if (response.data.status === 'success' && response.data.data) {
        const data: TemperatureData = {
          temperature: response.data.data.temperature,
          timestamp: new Date(response.data.data.timestamp),
          sensorId: response.data.data.sensorId,
          unit: response.data.data.unit,
        };

        this.latestRaspberryPiData = data;

        this.logger.log(
          `Broadcasting temperature: ${data.temperature}°C`,
        );

        this.socketService.broadcast('sensor:temperature', data);
      } else {
        this.logger.warn('Failed to fetch temperature data from FastAPI');
      }
    } catch (error) {
      this.logger.error(`Error fetching temperature from FastAPI: ${error.message}`);
    }
  }

  async getTemperatureData() {
    try {
      const response = await axios.get(`${this.fastApiUrl}/sensor/temp`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching temperature: ${error.message}`);
      return { status: 'error', message: 'Failed to fetch temperature data' };
    }
  }

  async getHumidityData() {
    try {
      const response = await axios.get(`${this.fastApiUrl}/sensor/hum`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching humidity: ${error.message}`);
      return { status: 'error', message: 'Failed to fetch humidity data' };
    }
  }

  getLatestTemperature() {
    return this.latestRaspberryPiData;
  }

  onModuleDestroy() {
    this.stopTemperatureSimulation();
    this.logger.log('Temperature sensor service shutting down');
  }
}