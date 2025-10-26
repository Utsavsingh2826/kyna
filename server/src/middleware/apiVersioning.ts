import { Request, Response, NextFunction } from 'express';

// API version configuration
export const API_VERSIONS = {
  v1: {
    version: '1.0.0',
    status: 'stable' as 'stable' | 'beta' | 'deprecated' | 'sunset',
    releaseDate: '2024-01-01',
    deprecationDate: null as string | null,
    sunsetDate: null as string | null
  },
  v2: {
    version: '2.0.0',
    status: 'beta' as 'stable' | 'beta' | 'deprecated' | 'sunset',
    releaseDate: '2024-09-26',
    deprecationDate: null as string | null,
    sunsetDate: null as string | null
  }
} as const;

export type ApiVersion = keyof typeof API_VERSIONS;

// Version middleware
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  // Extract version from URL path or header
  const versionFromPath = req.path.match(/^\/api\/v(\d+)\//);
  const versionFromHeader = req.headers['api-version'] as string;
  
  let version: ApiVersion = 'v1'; // Default to v1
  
  if (versionFromPath) {
    const versionNum = versionFromPath[1];
    version = `v${versionNum}` as ApiVersion;
  } else if (versionFromHeader) {
    version = versionFromHeader as ApiVersion;
  }
  
  // Validate version exists
  if (!API_VERSIONS[version]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid API version',
      supportedVersions: Object.keys(API_VERSIONS),
      currentVersion: version
    });
  }
  
  // Add version info to request
  req.apiVersion = version;
  req.apiInfo = API_VERSIONS[version];
  
  // Add version headers to response
  res.set({
    'API-Version': API_VERSIONS[version].version,
    'API-Status': API_VERSIONS[version].status,
    'API-Deprecation': API_VERSIONS[version].deprecationDate || 'Not deprecated'
  });
  
  // Check for deprecated version
  if (API_VERSIONS[version].status === 'deprecated') {
    res.set('Warning', `299 - "API version ${version} is deprecated"`);
  }
  
  next();
};

// Version info endpoint
export const getVersionInfo = (req: Request, res: Response) => {
  const versions = Object.entries(API_VERSIONS).map(([key, info]) => ({
    version: key,
    ...info
  }));
  
  res.json({
    success: true,
    message: 'API Version Information',
    currentVersion: req.apiVersion || 'v1',
    versions,
    usage: {
      path: '/api/v1/endpoint',
      header: 'API-Version: v1',
      default: 'v1 (if no version specified)'
    }
  });
};

// Deprecation warning middleware
export const deprecationWarning = (req: Request, res: Response, next: NextFunction) => {
  if (req.apiInfo?.status === 'deprecated') {
    res.set('Warning', `299 - "API version ${req.apiVersion} is deprecated. Please upgrade to a supported version."`);
  }
  
  if (req.apiInfo?.sunsetDate) {
    const sunsetDate = new Date(req.apiInfo.sunsetDate);
    const now = new Date();
    
    if (now >= sunsetDate) {
      return res.status(410).json({
        success: false,
        message: 'API version has been sunset',
        sunsetDate: req.apiInfo.sunsetDate,
        supportedVersions: Object.keys(API_VERSIONS).filter(v => API_VERSIONS[v as ApiVersion].status !== 'sunset')
      });
    }
  }
  
  next();
};

// Extend Request interface to include version info
declare global {
  namespace Express {
    interface Request {
      apiVersion?: ApiVersion;
      apiInfo?: typeof API_VERSIONS[ApiVersion];
    }
  }
}
