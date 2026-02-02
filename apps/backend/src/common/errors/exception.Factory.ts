import { BadRequestException } from "@nestjs/common";

/**
 *  Custom Exception Factory to format validation errors
 * @author Vinicius Berger
 * 
 * @description 
 * This factory creates a BadRequestException with a detailed message 
 * for each validation error encountered. It extracts the property name,
 * the first constraint message, and the received value from the validation errors.
 * 
 * @example
 * const exceptionFactory = new ExceptionFactory();
 * throw exceptionFactory.createException(errors);
 * 
 * @param errors - Array of validation errors
 * 
 */
export class ExceptionFactory{ 
    
    createException(errors: any[]) {
      const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints ? Object.values(error.constraints)[0] : 'Invalid',
        receivedValue: error.value,
      }));

      return new BadRequestException(result)
    }
  }