import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import {
  TemperatureSensorService,
  TemperatureData,
} from '../services/temperature-sensor.service';

@Controller('sensors')
export class SensorsController {
  constructor(
    private readonly temperatureSensorService: TemperatureSensorService,
  ) {}

  @Post('temperature/start')
  startTemperatureSimulation() {
    return this.temperatureSensorService.startTemperatureSimulation();
  }

  @Post('temperature/stop')
  stopTemperatureSimulation() {
    return this.temperatureSensorService.stopTemperatureSimulation();
  }

  @Post('temperature/pi')
  handleTemperatureFromRaspberryPi(@Body() payload: any) {
    return this.temperatureSensorService.handleTemperatureFromRaspberryPi(payload);
  }

  @Get('temp/data')
  async getTemperatureData() {
    return this.temperatureSensorService.getTemperatureData();
  }

  @Get('hum/data')
  async getHumidityData() {
    return this.temperatureSensorService.getHumidityData();
  }
}