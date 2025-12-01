import AdminJS, { BaseDatabase, BaseProperty, BaseResource, ValidationError } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import { randomUUID } from 'crypto';
import {
  getBlogPosts,
  getProducts,
  getPromotions,
  saveBlogPosts,
  saveProducts,
  savePromotions,
} from './shared.js';
import { verifyCredentials } from './auth.js';

class JsonDatabase extends BaseDatabase {
  static isAdapterFor() {
    return true;
  }
}

class JsonProperty extends BaseProperty {
  constructor(path, options = {}) {
    super({
      path,
      isId: path === 'id',
      isTitle: path === 'name' || path === 'title',
      isSortable: options.isSortable ?? true,
      type: options.type ?? 'string',
      availableValues: options.availableValues,
      isArray: options.isArray ?? false,
      ...options,
    });
  }
}

class JsonResource extends BaseResource {
  constructor({ id, load, save, properties }) {
    super({});
    this.resourceId = id;
    this.load = load;
    this.save = save;
    this.propertiesList = Object.entries(properties).map(([path, options]) => new JsonProperty(path, options));
  }

  static isAdapterFor(resource) {
    return resource instanceof JsonResource;
  }

  databaseName() {
    return 'json-store';
  }

  databaseType() {
    return 'json';
  }

  name() {
    return this.resourceId;
  }

  id() {
    return this.resourceId;
  }

  properties() {
    return this.propertiesList;
  }

  property(path) {
    return this.propertiesList.find((prop) => prop.path() === path);
  }

  async count(filter) {
    const records = await this.applyFilter(filter);
    return records.length;
  }

  async find(filter, { limit = 20, offset = 0, sort = {} } = {}) {
    const records = await this.applyFilter(filter);
    const sorted = this.sort(records, sort);
    const sliced = sorted.slice(offset, offset + limit);
    return sliced.map((record) => this.build(record));
  }

  async findOne(id) {
    const records = await this.load();
    const record = records.find((item) => item.id === id);
    return record ? this.build(record) : null;
  }

  async create(params) {
    const records = await this.load();
    const record = {
      id: params.id ?? randomUUID(),
      ...params,
    };
    records.push(record);
    await this.save(records);
    return record.id;
  }

  async update(id, params) {
    const records = await this.load();
    const index = records.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ValidationError({ id: { message: 'Enregistrement introuvable.' } });
    }
    const updated = { ...records[index], ...params };
    records[index] = updated;
    await this.save(records);
    return updated;
  }

  async delete(id) {
    const records = await this.load();
    const next = records.filter((item) => item.id !== id);
    await this.save(next);
  }

  build(params) {
    return super.build(params);
  }

  async applyFilter(filter) {
    const records = await this.load();
    if (!filter || !filter.filters || filter.filters.length === 0) {
      return records;
    }

    return records.filter((record) => {
      return filter.filters.every((item) => {
        const value = record[item.property];
        if (item.value === undefined || item.value === null || item.value === '') {
          return true;
        }
        if (typeof value === 'string') {
          return value.toLowerCase().includes(String(item.value).toLowerCase());
        }
        return value === item.value;
      });
    });
  }

  sort(records, sort) {
    if (!sort?.sortBy) {
      return records;
    }
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...records].sort((a, b) => {
      if (a[sort.sortBy] < b[sort.sortBy]) return -1 * direction;
      if (a[sort.sortBy] > b[sort.sortBy]) return 1 * direction;
      return 0;
    });
  }
}

AdminJS.registerAdapter({ Database: JsonDatabase, Resource: JsonResource });

const createResource = (config) => new JsonResource(config);

const resources = [
  createResource({
    id: 'products',
    load: getProducts,
    save: saveProducts,
    properties: {
      id: { isVisible: { list: true, filter: false, show: true, edit: false } },
      name: { isTitle: true },
      brand: {},
      category: {},
      price: { type: 'number' },
      image: {},
      description: { type: 'richtext' },
      features: { type: 'mixed', isArray: true },
      inStock: { type: 'boolean' },
    },
  }),
  createResource({
    id: 'blogPosts',
    load: getBlogPosts,
    save: saveBlogPosts,
    properties: {
      id: { isVisible: { list: true, filter: false, show: true, edit: false } },
      title: { isTitle: true },
      excerpt: { type: 'textarea' },
      content: { type: 'richtext' },
      image: {},
      date: { type: 'datetime' },
      category: {},
    },
  }),
  createResource({
    id: 'promotions',
    load: getPromotions,
    save: savePromotions,
    properties: {
      id: { isVisible: { list: true, filter: false, show: true, edit: false } },
      title: { isTitle: true },
      description: { type: 'textarea' },
      image: {},
      startDate: { type: 'datetime' },
      endDate: { type: 'datetime' },
      discount: { type: 'number' },
    },
  }),
];

export const createAdminRouter = () => {
  const admin = new AdminJS({
    rootPath: '/admin',
    resources,
    branding: {
      companyName: 'Secunologi',
      softwareBrothers: false,
    },
  });

  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        const user = await verifyCredentials(email, password);
        return user ?? null;
      },
      cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'adminjs-secret',
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
    }
  );

  const wrapper = express.Router();
  wrapper.use(admin.options.rootPath, router);
  return { admin, router: wrapper };
};
