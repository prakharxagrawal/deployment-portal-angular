/**
 * Service Interface - Represents a service/application in the system
 * 
 * This interface defines the structure of a service object used for
 * deployment requests. Services represent the applications or components
 * that can be deployed through the deployment portal.
 */
export interface Service {
  // Unique identifier for the service record
  id: number;
  
  // Name of the service/application (e.g., "User Management Service", "Payment Gateway")
  name: string;
}
