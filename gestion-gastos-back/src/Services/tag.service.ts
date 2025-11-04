// tag.service.ts
import { User } from "../User/user.entity.js";
import { Tag } from "../Tag/tag.entity.js";

export class TagService {
  static defaultTags = [
    { name: 'Urgente', color: '#dc3545', description: 'Gastos urgentes o importantes' },
    { name: 'Trabajo', color: '#007bff', description: 'Gastos relacionados al trabajo' },
    { name: 'Personal', color: '#28a745', description: 'Gastos personales' },
    { name: 'Familia', color: '#6f42c1', description: 'Gastos familiares' },
    { name: 'Ocio', color: '#fd7e14', description: 'Gastos de entretenimiento' },
    { name: 'Salud', color: '#e83e8c', description: 'Gastos de salud' },
    { name: 'Educación', color: '#20c997', description: 'Gastos educativos' },
  ];

  static async createDefaultTags(em: any, user: User) {
    const tags = [];
    
    for (const tagData of this.defaultTags) {
      const tag = em.create(Tag, {
        ...tagData,
        user: user
      });
      tags.push(tag);
    }
    
    await em.flush();
    return tags;
  }

  static async getTagsByUser(em: any, userId: string) {
    return em.find(Tag, {user: { id : userId }});
  }
}