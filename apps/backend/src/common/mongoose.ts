import { DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

/**
 * * @description
 * Static wrapper for the MongooseModule to centralize database connection logic.
 *
 * 
* * - DynamicModule: returns the module configuration to be used in the imports array of AppModule.
* * - forRootAsync: enables asynchronous configuration, ensuring environment variables are loaded 
 *
 * 
 *  before the connection attempt is made.
 * * - imports [ConfigModule]: ensures the configuration system is available within the factory.
 * * - inject [ConfigService]: injects the service used to retrieve secure environment strings.
 * 
 * * - useFactory: an asynchronous factory function that pulls the 'MONGO_DB_STRING_CONNECTION' from the .env file to establish the MongoDB connection.
 * 
 * * @author Vinicius Berger
 * */

// mongoose module to connect to MongoDB
export class MongooseConnectionModule {

    static init(): DynamicModule {
        return MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
            uri: config.get<string>('MONGO_DB_STRING_CONNECTION'),
        }),
        });
    }
}

    