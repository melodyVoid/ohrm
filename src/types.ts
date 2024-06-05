export interface Registry {
  registry: string
  home?: string
  publish_registry?: string
}

export interface Ohrmrc {
  [name: string]: Registry
}

type Group = `@${string}:registry`

export interface Ohpmrc {
  /**
   * 仓库配置，支持配置多个地址，使用英文逗号分割
   */
  registry: string

  /**
   * 支持配置含有 group 的仓库，优先匹配
   */
  [scope: Group]: string | undefined

  /**
   * 代理配置
   */
  no_proxy?: string
  http_proxy?: string
  https_proxy?: string

  /**
   * 证书校验配置
   * 是否校验 https 仓库的证书，取值：true|false, default: true, 为 true 时需要配置 ca_files 证书路径
   */
  strict_ssl?: boolean
  ca_files?: string

  /**
   * 发布配置
   */

  /**
   * 因为 registry 支持配置多仓，所以此处需明确指定发布仓
   */
  publish_registry?: string

  /**
   * 用户发布三方库的发布 id，从云端个人中心获取
   */
  publish_id?: string

  /**
   * 用户私钥文件路径，公钥需在云端进行配置
   */
  key_path?: string

  /**
   * 缓存路径, 默认在用户目录下的 .ohpm/cache
   */
  cache?: string

  /**
   * 日志级别, 取值：debug|info|warn|error, default: info
   */
  log_level?: 'debug' | 'info' | 'warn' | 'error'

  /**
   * 网络请求超时时间, 单位 ms, 默认为 60s
   */
  fetch_timeout?: number
  [key: string]: string | number | boolean | undefined
}
