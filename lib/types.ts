export interface Plugin {
  name: string
  description: string
  author: string
  pypiPackage: string
  pypiInfo?: PyPIInfo
}

export interface PyPIInfo {
  version: string
  description: string
  author: string
  homePage: string
}