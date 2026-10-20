import { z } from 'zod'

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    if (parsed.body) req.body = parsed.body
    if (parsed.query) req.query = parsed.query
    if (parsed.params) req.params = parsed.params

    next()
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map((i) => ({
        field: i.path.slice(1).join('.'),
        message: i.message,
      }))
      return res.status(400).json({
        error: 'Validation failed',
        details: issues,
      })
    }
    next(err)
  }
}
