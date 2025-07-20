/**
 * Release Interface - Represents a release version in the system
 * 
 * This interface defines the structure of a release object used for
 * deployment requests. Releases represent specific versions or iterations
 * of software that can be deployed to various environments.
 */
export interface Release {
  // Unique identifier for the release record (optional for new releases)
  id?: number;
  
  // Release name/version (e.g., "2024-01", "v1.2.3", "Sprint-45")
  // Follows YYYY-MM pattern for consistency
  name: string;
}
