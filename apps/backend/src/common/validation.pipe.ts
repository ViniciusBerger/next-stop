import { ValidationPipe } from '@nestjs/common';
import { ExceptionFactory } from './errors/exception.Factory';

/**
 * * 
 * @description
 * Global validation pipe to be used across the application
 * - whitelist: true - strips properties that do not have any decorators
 * 
 * - forbidNonWhitelisted: true - throws an error if non-whitelisted properties are present
 * - transform: true - automatically transforms payloads to be objects typed according to their DTO classes
 * 
 * - transformOptions: { 
 *          exposeUnsetFields: false } - ensures that fields not present in the incoming request are not added with undefined values
 * 
 * - disableErrorMessages: false - ensures error messages are sent to the client (useful for debugging)
 * - exceptionFactory: custom factory to create exceptions from validation errors
 * 
 * @author Vinicius Berger
 * 
 */
// 
export const GlobalValidationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        exposeUnsetFields: false,
    },
    //disableErrorMessages: false,
    exceptionFactory: (errors) => {
       
        console.log('VALIDATION FAILED:', JSON.stringify(errors, null, 2));
        return new ExceptionFactory().createException(errors);
    }
});