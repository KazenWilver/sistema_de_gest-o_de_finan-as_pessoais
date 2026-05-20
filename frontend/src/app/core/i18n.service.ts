import { Injectable, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

const FALLBACK_PT_TRANSLATIONS: Record<string, string> = {
  'nav.dashboard': 'Painel', 'nav.transactions': 'Transações', 'nav.accounts': 'Contas',
  'nav.categories': 'Categorias', 'nav.budgets': 'Orçamentos', 'nav.reports': 'Relatórios',
  'nav.settings': 'Definições', 'nav.admin': 'Admin', 'nav.logout': 'Sair',
  'common.save': 'Guardar', 'common.cancel': 'Cancelar', 'common.create': 'Criar',
  'common.edit': 'Editar', 'common.delete': 'Eliminar', 'common.confirm': 'Confirmar',
  'common.yes': 'Sim', 'common.no': 'Não', 'common.loading': 'A carregar...',
  'common.search': 'Pesquisar', 'common.filter': 'Filtrar', 'common.export': 'Exportar',
  'common.new': 'Novo', 'common.all': 'Todos', 'common.none': 'Nenhum',
  'auth.login': 'Entrar', 'auth.register': 'Registar', 'auth.email': 'Email',
  'auth.password': 'Palavra-passe', 'auth.name': 'Nome', 'auth.forgot': 'Esqueceu a senha?',
  'auth.no_account': 'Não tem conta?', 'auth.has_account': 'Já tem conta?',
  'auth.welcome': 'Bem-vindo de volta', 'auth.subtitle': 'Gerir as suas finanças pessoais',
  'dash.greeting': 'Olá', 'dash.month_summary': 'Resumo do mês',
  'dash.income': 'Receitas', 'dash.expense': 'Despesas', 'dash.balance': 'Saldo',
  'dash.savings': 'Poupança', 'dash.recent': 'Transações recentes', 'dash.budgets': 'Orçamentos',
  'tx.title': 'Transações', 'tx.subtitle': 'Histórico financeiro',
  'tx.new': 'Nova Transação', 'tx.type': 'Tipo', 'tx.amount': 'Valor',
  'tx.description': 'Descrição', 'tx.date': 'Data', 'tx.account': 'Conta',
  'tx.category': 'Categoria', 'tx.method': 'Método', 'tx.notes': 'Notas',
  'tx.income': 'Receita', 'tx.expense': 'Despesa', 'tx.delete_confirm': 'Eliminar esta transação?',
  'acc.title': 'Contas', 'acc.subtitle': 'Gerir contas financeiras', 'acc.new': 'Nova Conta',
  'acc.name': 'Nome', 'acc.type': 'Tipo', 'acc.currency': 'Moeda',
  'acc.cash': 'Dinheiro', 'acc.bank': 'Banco', 'acc.mobile': 'Mobile Money',
  'acc.savings': 'Poupança', 'acc.other': 'Outro', 'acc.delete_confirm': 'Eliminar esta conta?',
  'cat.title': 'Categorias', 'cat.subtitle': 'Organizar receitas e despesas',
  'cat.new': 'Nova Categoria', 'cat.incomes': 'Receitas', 'cat.expenses': 'Despesas',
  'cat.color': 'Cor', 'cat.icon': 'Ícone', 'cat.default': 'Padrão',
  'cat.delete_confirm': 'Eliminar esta categoria?',
  'budget.title': 'Orçamentos', 'budget.subtitle': 'Controlar limites de gastos',
  'budget.new': 'Novo Orçamento', 'budget.limit': 'Limite', 'budget.period': 'Período',
  'budget.weekly': 'Semanal', 'budget.monthly': 'Mensal', 'budget.yearly': 'Anual',
  'budget.start': 'Início', 'budget.end': 'Fim', 'budget.used': 'utilizado',
  'budget.general': 'Geral (todas)', 'budget.delete_confirm': 'Eliminar este orçamento?',
  'report.title': 'Relatórios', 'report.subtitle': 'Análise financeira detalhada',
  'report.by_category': 'Por categoria', 'report.summary': 'Resumo',
  'report.csv': 'Exportar CSV', 'report.pdf': 'Exportar PDF',
  'settings.title': 'Definições', 'settings.subtitle': 'Personalizar a sua conta',
  'settings.profile': 'Perfil', 'settings.security': 'Segurança',
  'settings.language': 'Idioma', 'settings.theme': 'Tema',
  'settings.current_pw': 'Palavra-passe actual', 'settings.new_pw': 'Nova palavra-passe',
  'settings.confirm_pw': 'Confirmar palavra-passe', 'settings.change_pw': 'Alterar Palavra-passe',
  'settings.save_profile': 'Guardar Perfil',
  'toast.saved': 'Guardado com sucesso!', 'toast.deleted': 'Eliminado com sucesso!',
  'toast.error': 'Ocorreu um erro.', 'toast.pw_changed': 'Palavra-passe alterada!',
  'toast.pw_mismatch': 'As palavras-passe não coincidem.',
  'confirm.delete_title': 'Confirmar Eliminação',
  'confirm.delete_msg': 'Tem a certeza que deseja eliminar? Esta acção não pode ser revertida.',
  "confirm.logout_title": "Terminar Sessão", "confirm.logout_msg": "Deseja sair da sua conta?",
  'common.clear': 'Limpar', 'common.prev': 'Anterior', 'common.next': 'Próxima',
  'tx.empty': 'Sem transações', 'tx.empty_hint': 'Clique em "+ Nova Transação" para começar',
  'budget.empty': 'Sem orçamentos', 'budget.empty_hint': 'Crie um orçamento para controlar os seus gastos',
  'acc.empty': 'Sem contas', 'acc.empty_hint': 'Crie uma conta para começar',
  'cat.empty': 'Sem categorias', 'cat.empty_hint': 'Crie uma categoria para organizar',
  'report.empty': 'Sem dados para o período selecionado',
  'dash.no_data': 'Sem dados disponíveis',
  'admin.title': 'Administração', 'admin.subtitle': 'Gestão de utilizadores',
  'admin.role': 'Papel', 'admin.status': 'Estado', 'admin.active': 'Activo', 'admin.inactive': 'Inactivo',
  'admin.delete_confirm': 'Eliminar este utilizador?',
  'admin.role_updated': 'Papel actualizado', 'admin.status_updated': 'Estado actualizado',
  'admin.users': 'Utilizadores', 'admin.delete_user': 'Eliminar utilizador',
  'nav.finances': 'Finanças Pessoais',
  'report.no_category': 'Sem categoria', 'report.no_data_period': 'Sem dados para este período',
  'report.csv_exported': 'CSV exportado!', 'report.pdf_exported': 'PDF exportado!',
  'chart.income_expense': 'Receitas vs Despesas', 'chart.by_category': 'Despesas por Categoria',
  'chart.trend': 'Tendência Mensal', 'chart.budget_usage': 'Uso de Orçamentos',
  'dash.user_fallback': 'Utilizador',
  'auth.invalid_email': 'E-mail inválido', 'auth.min_password': 'Mínimo 5 caracteres', 'auth.min_name': 'Mínimo 2 caracteres',
  'auth.email_placeholder': 'exemplo@email.com', 'auth.password_placeholder': '••••••', 'auth.name_placeholder': 'Seu nome',
  'auth.token_placeholder': 'Token', 'auth.token_prefix': 'Token',
  'theme.light': 'Modo claro', 'theme.dark': 'Modo escuro', 'theme.light_label': 'Claro', 'theme.dark_label': 'Escuro',
  'currency.aoa': 'AOA - Kwanza', 'currency.usd': 'USD - Dólar', 'currency.eur': 'EUR - Euro',
  'admin.role_user': 'Utilizador', 'admin.role_admin': 'Administrador',
  'validation.required': 'Campo obrigatório',
  'validation.min_amount': 'O valor deve ser maior que zero'
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translations: any = {};
  private translationCache: Record<string, any> = {};
  private currentLoadingLang: string = '';
  private langSubject = new BehaviorSubject<string>(this.getStoredLang());
  public lang$ = this.langSubject.asObservable();
  public readonly languages = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'ja', label: '日本語' },
    { code: 'it', label: 'Italiano' }
  ];

  constructor(
    private http: HttpClient,
    private appRef: ApplicationRef
  ) {
    const initialLang = this.langSubject.value;
    this.loadTranslations(initialLang);
    this.preloadAllLanguages();
  }

  get currentLang(): string {
    return this.langSubject.value;
  }

  setLanguage(lang: string): void {
    localStorage.setItem('sgfp_lang', lang);
    this.langSubject.next(lang);
    this.loadTranslations(lang);
  }

  t(key: string): string {
    // Try flat lookup first
    if (this.translations && this.translations[key]) {
      return this.translations[key];
    }
    // Fallback to dot-split nesting lookup
    const keys = key.split('.');
    let result: any = this.translations;
    for (const k of keys) {
      result = result?.[k];
    }
    if (typeof result === 'string') {
      return result;
    }
    // Static Portuguese translation as final fallback
    return FALLBACK_PT_TRANSLATIONS[key] || key;
  }

  translateCategory(name: string | undefined | null): string {
    if (!name) return '';
    const mapping: Record<string, string> = {
      'Salário': 'cat.salary',
      'Freelance': 'cat.freelance',
      'Investimentos': 'cat.investments',
      'Alimentação': 'cat.food',
      'Transporte': 'cat.transport',
      'Saúde': 'cat.health',
      'Educação': 'cat.education',
      'Lazer': 'cat.leisure',
      'Habitação': 'cat.housing',
      'Outros': 'cat.others'
    };
    const key = mapping[name];
    return key ? this.t(key) : name;
  }

  private preloadAllLanguages(): void {
    for (const lang of this.languages) {
      if (lang.code === this.langSubject.value) continue;
      this.http.get<any>(`/assets/i18n/${lang.code}.json`).subscribe({
        next: (data) => {
          this.translationCache[lang.code] = data;
        },
        error: () => {
          this.translationCache[lang.code] = {};
        }
      });
    }
  }

  private loadTranslations(lang: string): void {
    if (this.translationCache[lang]) {
      this.translations = this.translationCache[lang];
      this.appRef.tick();
      return;
    }

    this.currentLoadingLang = lang;
    this.http.get<any>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translationCache[lang] = data;
        if (this.currentLoadingLang === lang) {
          this.translations = data;
          setTimeout(() => this.appRef.tick(), 0);
        }
      },
      error: () => {
        console.warn(`Translation file for '${lang}' not found, falling back to PT`);
        this.translationCache[lang] = {};
        if (this.currentLoadingLang === lang) {
          this.translations = {};
          setTimeout(() => this.appRef.tick(), 0);
        }
      }
    });
  }

  private getStoredLang(): string {
    const stored = localStorage.getItem('sgfp_lang');
    if (stored) return stored;

    const storedUser = localStorage.getItem('sgfp_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.language) {
          return user.language;
        }
      } catch (e) {}
    }
    return 'pt';
  }
}
