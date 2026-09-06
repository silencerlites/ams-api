export default class BaseModel { static clean(data = {}) {
    return Object.fromEntries( Object.entries(data).filter(([, value]) => value !== undefined));
  }
}