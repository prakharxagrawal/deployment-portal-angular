/**
 * Deployment Interface - Represents a deployment request in the system
 * 
 * This interface defines the structure of a deployment request object
 * used throughout the frontend application. It includes all properties
 * needed for creating, displaying, and managing deployment requests.
 */
export interface Deployment {
  // Unique identifier for the deployment record (auto-generated by backend)
  id?: number;
  
  // Human-readable serial number for easy identification (e.g., "DEP-001")
  serialNumber?: string;
  
  // Customer Service Identifier - identifies which customer service this deployment is for
  csiId: string;
  
  // Name of the service/application being deployed
  service: string;
  
  // Unique identifier for this specific deployment request
  requestId: string;
  
  // Git branch name for the release (optional, may be derived from release)
  releaseBranch?: string;
  
  // Release version being deployed (e.g., "2024-01", "v1.2.3")
  release: string;
  
  // Current status of the deployment ("Open", "In Progress", "Pending", "Completed")
  status: string;
  
  // Username of the person who created this deployment request
  createdBy?: string;
  
  // Development team responsible for this deployment
  team: string;
  
  // ISO timestamp when the deployment was first requested
  dateRequested?: string;
  
  // ISO timestamp when the deployment was last modified
  dateModified?: string;
  
  // Array of target environments for this deployment (e.g., ["UAT1", "PROD"])
  environments: string[];
  
  // Flag indicating if this is a configuration-only request
  isConfig?: boolean;
  
  // Additional request ID for configuration requests (required when isConfig is true)
  configRequestId?: string;
  
  // Flag indicating if the deployment is ready for production use
  productionReady?: boolean;
  
  // RLM (Release Management) IDs for each environment
  // These track the deployment in the release management system
  rlmIdUat1?: string;    // UAT1 environment RLM ID
  rlmIdUat2?: string;    // UAT2 environment RLM ID  
  rlmIdUat3?: string;    // UAT3 environment RLM ID
  rlmIdPerf1?: string;   // Performance 1 environment RLM ID
  rlmIdPerf2?: string;   // Performance 2 environment RLM ID
  rlmIdProd1?: string;   // Production 1 environment RLM ID
  rlmIdProd2?: string;   // Production 2 environment RLM ID
}
