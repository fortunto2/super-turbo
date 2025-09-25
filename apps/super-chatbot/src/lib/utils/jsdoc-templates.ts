/**
 * Шаблоны JSDoc для стандартизации документации
 * Помогают поддерживать единообразную документацию в проекте
 */

/**
 * Шаблон для React компонентов
 * @template T - Тип пропсов компонента
 * @param props - Пропсы компонента
 * @param props.className - CSS классы для стилизации
 * @param props.children - Дочерние элементы
 * @returns JSX элемент компонента
 * @example
 * ```tsx
 * <MyComponent className="custom-class">
 *   <div>Content</div>
 * </MyComponent>
 * ```
 */
export const COMPONENT_TEMPLATE = `
/**
 * {componentName} - {description}
 * 
 * @param props - Пропсы компонента
 * @param props.className - CSS классы для стилизации
 * @param props.children - Дочерние элементы
 * @returns JSX элемент компонента
 * @example
 * \`\`\`tsx
 * <{componentName} className="custom-class">
 *   <div>Content</div>
 * </{componentName}>
 * \`\`\`
 */
`;

/**
 * Шаблон для React хуков
 * @template T - Тип возвращаемого значения
 * @param params - Параметры хука
 * @returns Объект с состоянием и методами хука
 * @example
 * ```tsx
 * const { value, setValue } = useMyHook({ initialValue: 'test' });
 * ```
 */
export const HOOK_TEMPLATE = `
/**
 * {hookName} - {description}
 * 
 * @param params - Параметры хука
 * @returns Объект с состоянием и методами хука
 * @example
 * \`\`\`tsx
 * const { value, setValue } = use{hookName}({ initialValue: 'test' });
 * \`\`\`
 */
`;

/**
 * Шаблон для утилитарных функций
 * @template T - Тип входного значения
 * @template R - Тип возвращаемого значения
 * @param value - Входное значение
 * @param options - Опциональные параметры
 * @returns Обработанное значение
 * @example
 * ```ts
 * const result = myUtilityFunction('input', { option: true });
 * ```
 */
export const UTILITY_TEMPLATE = `
/**
 * {functionName} - {description}
 * 
 * @param value - Входное значение
 * @param options - Опциональные параметры
 * @returns Обработанное значение
 * @example
 * \`\`\`ts
 * const result = {functionName}('input', { option: true });
 * \`\`\`
 */
`;

/**
 * Шаблон для API функций
 * @template T - Тип входных данных
 * @template R - Тип ответа
 * @param data - Данные для отправки
 * @param options - Опциональные параметры запроса
 * @returns Promise с ответом API
 * @throws {Error} При ошибке запроса
 * @example
 * ```ts
 * const response = await apiFunction({ id: 1 }, { timeout: 5000 });
 * ```
 */
export const API_TEMPLATE = `
/**
 * {functionName} - {description}
 * 
 * @param data - Данные для отправки
 * @param options - Опциональные параметры запроса
 * @returns Promise с ответом API
 * @throws {Error} При ошибке запроса
 * @example
 * \`\`\`ts
 * const response = await {functionName}({ id: 1 }, { timeout: 5000 });
 * \`\`\`
 */
`;

/**
 * Шаблон для типов и интерфейсов
 * @template T - Обобщенный тип
 * @property {type} propertyName - Описание свойства
 * @example
 * ```ts
 * const myObject: MyInterface = { propertyName: 'value' };
 * ```
 */
export const TYPE_TEMPLATE = `
/**
 * {typeName} - {description}
 * 
 * @template T - Обобщенный тип
 * @property {type} propertyName - Описание свойства
 * @example
 * \`\`\`ts
 * const myObject: {typeName} = { propertyName: 'value' };
 * \`\`\`
 */
`;

/**
 * Шаблон для констант
 * @constant {type} CONSTANT_NAME - Описание константы
 * @example
 * ```ts
 * console.log(CONSTANT_NAME); // 'value'
 * ```
 */
export const CONSTANT_TEMPLATE = `
/**
 * {constantName} - {description}
 * 
 * @constant {type} {constantName} - Описание константы
 * @example
 * \`\`\`ts
 * console.log({constantName}); // 'value'
 * \`\`\`
 */
`;

/**
 * Шаблон для enum
 * @enum {type} EnumName - Описание enum
 * @property {type} VALUE1 - Описание значения
 * @example
 * ```ts
 * const value = EnumName.VALUE1;
 * ```
 */
export const ENUM_TEMPLATE = `
/**
 * {enumName} - {description}
 * 
 * @enum {type} {enumName} - Описание enum
 * @property {type} VALUE1 - Описание значения
 * @example
 * \`\`\`ts
 * const value = {enumName}.VALUE1;
 * \`\`\`
 */
`;

/**
 * Шаблон для классов
 * @class ClassName - Описание класса
 * @template T - Обобщенный тип
 * @property {type} propertyName - Описание свойства
 * @method methodName - Описание метода
 * @example
 * ```ts
 * const instance = new ClassName();
 * instance.methodName();
 * ```
 */
export const CLASS_TEMPLATE = `
/**
 * {className} - {description}
 * 
 * @class {className} - Описание класса
 * @template T - Обобщенный тип
 * @property {type} propertyName - Описание свойства
 * @method methodName - Описание метода
 * @example
 * \`\`\`ts
 * const instance = new {className}();
 * instance.methodName();
 * \`\`\`
 */
`;

/**
 * Утилита для генерации JSDoc комментариев
 */
export class JSDocGenerator {
  /**
   * Генерирует JSDoc для компонента
   */
  static component(name: string, description: string): string {
    return COMPONENT_TEMPLATE.replace(/{componentName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для хука
   */
  static hook(name: string, description: string): string {
    return HOOK_TEMPLATE.replace(/{hookName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для утилиты
   */
  static utility(name: string, description: string): string {
    return UTILITY_TEMPLATE.replace(/{functionName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для API функции
   */
  static api(name: string, description: string): string {
    return API_TEMPLATE.replace(/{functionName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для типа
   */
  static type(name: string, description: string): string {
    return TYPE_TEMPLATE.replace(/{typeName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для константы
   */
  static constant(name: string, description: string): string {
    return CONSTANT_TEMPLATE.replace(/{constantName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для enum
   */
  static enum(name: string, description: string): string {
    return ENUM_TEMPLATE.replace(/{enumName}/g, name).replace(
      /{description}/g,
      description
    );
  }

  /**
   * Генерирует JSDoc для класса
   */
  static class(name: string, description: string): string {
    return CLASS_TEMPLATE.replace(/{className}/g, name).replace(
      /{description}/g,
      description
    );
  }
}
