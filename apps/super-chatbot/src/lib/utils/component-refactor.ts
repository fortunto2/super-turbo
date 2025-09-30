/**
 * Интерфейс для конфигурации рефакторинга компонента
 */
export interface ComponentRefactorConfig {
  /** Максимальное количество строк в компоненте */
  maxLines?: number;
  /** Максимальное количество пропсов */
  maxProps?: number;
  /** Максимальное количество хуков */
  maxHooks?: number;
  /** Максимальное количество состояний */
  maxStates?: number;
}

/**
 * Анализирует компонент и определяет, нужен ли рефакторинг
 */
export function analyzeComponent(
  componentCode: string,
  config: ComponentRefactorConfig = {}
): {
  needsRefactor: boolean;
  issues: string[];
  metrics: {
    lines: number;
    props: number;
    hooks: number;
    states: number;
    functions: number;
  };
} {
  const { maxLines = 200, maxProps = 10, maxHooks = 8, maxStates = 5 } = config;

  const issues: string[] = [];

  // Подсчет строк
  const lines = componentCode.split("\n").length;
  if (lines > maxLines) {
    issues.push(
      `Компонент слишком длинный: ${lines} строк (максимум ${maxLines})`
    );
  }

  // Подсчет пропсов (упрощенный анализ)
  const propsMatch = componentCode.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
  const props = propsMatch
    ? propsMatch[1]?.split("\n").filter((line) => line.trim().includes(":"))
        .length || 0
    : 0;
  if (props > maxProps) {
    issues.push(`Слишком много пропсов: ${props} (максимум ${maxProps})`);
  }

  // Подсчет хуков
  const hooks = (componentCode.match(/use[A-Z]\w+/g) || []).length;
  if (hooks > maxHooks) {
    issues.push(`Слишком много хуков: ${hooks} (максимум ${maxHooks})`);
  }

  // Подсчет состояний
  const states = (componentCode.match(/useState/g) || []).length;
  if (states > maxStates) {
    issues.push(`Слишком много состояний: ${states} (максимум ${maxStates})`);
  }

  // Подсчет функций
  const functions = (
    componentCode.match(/const\s+\w+\s*=\s*(?:useCallback\s*)?\(/g) || []
  ).length;

  const metrics = {
    lines,
    props,
    hooks,
    states,
    functions,
  };

  return {
    needsRefactor: issues.length > 0,
    issues,
    metrics,
  };
}

/**
 * Предлагает стратегии рефакторинга для компонента
 */
export function suggestRefactorStrategies(
  analysis: ReturnType<typeof analyzeComponent>
): string[] {
  const strategies: string[] = [];
  const { metrics, issues } = analysis;

  if (issues.some((issue) => issue.includes("строк"))) {
    strategies.push("Разделить компонент на более мелкие подкомпоненты");
    strategies.push("Вынести логику в кастомные хуки");
    strategies.push("Создать отдельные файлы для сложных частей");
  }

  if (issues.some((issue) => issue.includes("пропсов"))) {
    strategies.push("Группировать связанные пропсы в объекты");
    strategies.push("Использовать контекст для передачи данных");
    strategies.push("Создать интерфейс для конфигурации");
  }

  if (issues.some((issue) => issue.includes("хуков"))) {
    strategies.push("Объединить связанные хуки в кастомный хук");
    strategies.push("Использовать useReducer вместо множественных useState");
    strategies.push("Вынести логику в отдельные утилиты");
  }

  if (issues.some((issue) => issue.includes("состояний"))) {
    strategies.push("Использовать useReducer для сложного состояния");
    strategies.push("Создать кастомный хук для управления состоянием");
    strategies.push("Разделить состояние на логические группы");
  }

  if (metrics.functions > 10) {
    strategies.push("Вынести функции в отдельные утилиты");
    strategies.push("Создать кастомные хуки для групп функций");
    strategies.push("Использовать useCallback для оптимизации");
  }

  return strategies;
}

/**
 * Создает шаблон для разделения компонента
 */
export function createComponentSplitTemplate(
  componentName: string,
  parts: string[]
): string {
  return `
// ${componentName} - Главный компонент
export function ${componentName}({ ...props }: ${componentName}Props) {
  return (
    <div className="${componentName.toLowerCase()}-container">
      ${parts.map((part) => `<${part} {...props} />`).join("\n      ")}
    </div>
  );
}

// Подкомпоненты
${parts
  .map(
    (part) => `
interface ${part}Props {
  // Определить пропсы для ${part}
}

function ${part}({ ...props }: ${part}Props) {
  return (
    <div className="${part.toLowerCase()}">
      {/* Реализация ${part} */}
    </div>
  );
}
`
  )
  .join("\n")}
`;
}

/**
 * Создает шаблон для кастомного хука
 */
export function createCustomHookTemplate(
  hookName: string,
  functionality: string
): string {
  return `
/**
 * ${hookName} - ${functionality}
 * 
 * @returns Объект с состоянием и методами
 */
export function ${hookName}() {
  // Состояние
  const [state, setState] = useState(initialState);
  
  // Методы
  const method1 = useCallback(() => {
    // Реализация метода 1
  }, []);
  
  const method2 = useCallback(() => {
    // Реализация метода 2
  }, []);
  
  return {
    state,
    method1,
    method2,
  };
}
`;
}

/**
 * Создает шаблон для утилитарных функций
 */
export function createUtilityTemplate(
  functionName: string,
  description: string
): string {
  return `
/**
 * ${functionName} - ${description}
 * 
 * @param value - Входное значение
 * @returns Обработанное значение
 */
export function ${functionName}(value: unknown): unknown {
  // Реализация функции
  return value;
}
`;
}

/**
 * Утилита для автоматического рефакторинга
 */
export class ComponentRefactorer {
  private config: ComponentRefactorConfig;

  constructor(config: ComponentRefactorConfig = {}) {
    this.config = {
      maxLines: 200,
      maxProps: 10,
      maxHooks: 8,
      maxStates: 5,
      ...config,
    };
  }

  /**
   * Анализирует компонент и предлагает рефакторинг
   */
  analyze(componentCode: string) {
    const analysis = analyzeComponent(componentCode, this.config);
    const strategies = suggestRefactorStrategies(analysis);

    return {
      ...analysis,
      strategies,
    };
  }

  /**
   * Создает план рефакторинга
   */
  createRefactorPlan(
    componentName: string,
    analysis: ReturnType<typeof this.analyze>
  ) {
    const plan = {
      componentName,
      priority:
        analysis.issues.length > 3
          ? "high"
          : analysis.issues.length > 1
            ? "medium"
            : "low",
      steps: [] as string[],
      estimatedTime: 0,
    };

    if (analysis.issues.some((issue: string) => issue.includes("строк"))) {
      plan.steps.push("Разделить компонент на подкомпоненты");
      plan.estimatedTime += 60; // минуты
    }

    if (analysis.issues.some((issue: string) => issue.includes("хуков"))) {
      plan.steps.push("Создать кастомные хуки");
      plan.estimatedTime += 30;
    }

    if (analysis.issues.some((issue: string) => issue.includes("пропсов"))) {
      plan.steps.push("Оптимизировать пропсы");
      plan.estimatedTime += 20;
    }

    if (analysis.issues.some((issue: string) => issue.includes("состояний"))) {
      plan.steps.push("Упростить состояние");
      plan.estimatedTime += 25;
    }

    return plan;
  }
}
