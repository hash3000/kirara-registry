interface PyPIInfo {
  version: string
  description: string
  author: string
  homePage: string
}

import fetch from "node-fetch"

export async function fetchPyPIInfo(packageName: string): Promise<PyPIInfo> {
  const response = await fetch(`https://pypi.org/pypi/${packageName}/json`)
  const data = await response.json()

  return {
    version: data.info.version,
    description: data.info.summary,
    author: data.info.author,
    homePage: data.info.home_page,
  }
}

