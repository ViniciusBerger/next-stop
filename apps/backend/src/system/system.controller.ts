import { Controller, Get, Patch, Body } from "@nestjs/common";
import { SystemService } from "./system.service";

@Controller("system-settings")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  getAll() {
    return this.systemService.getAll();
  }

  @Patch()
  update(@Body() body: { key: string; value: string; admin: string }) {
    return this.systemService.update(body.key, body.value, body.admin);
  }
}