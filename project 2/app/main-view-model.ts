import { Observable } from '@nativescript/core';
import { StockAnalyzerService } from './services/stock-analyzer.service';
import { AnalysisResult } from './models/stock-analysis.model';

export class MainViewModel extends Observable {
  private stockAnalyzer: StockAnalyzerService;
  private _searchSymbol: string = '';
  private _analysis: AnalysisResult | null = null;
  private _isLoading: boolean = false;

  constructor() {
    super();
    this.stockAnalyzer = new StockAnalyzerService();
  }

  get searchSymbol(): string {
    return this._searchSymbol;
  }

  set searchSymbol(value: string) {
    if (this._searchSymbol !== value) {
      this._searchSymbol = value;
      this.notifyPropertyChange('searchSymbol', value);
    }
  }

  get analysis(): AnalysisResult | null {
    return this._analysis;
  }

  set analysis(value: AnalysisResult | null) {
    if (this._analysis !== value) {
      this._analysis = value;
      this.notifyPropertyChange('analysis', value);
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    if (this._isLoading !== value) {
      this._isLoading = value;
      this.notifyPropertyChange('isLoading', value);
    }
  }

  async analyzeStock() {
    if (!this.searchSymbol || this.isLoading) return;

    try {
      this.isLoading = true;
      const result = await this.stockAnalyzer.analyzeStock(this.searchSymbol.toUpperCase());
      this.analysis = {
        ...result,
        recommendation: this.translateRecommendation(result.recommendation)
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      // TODO: Ajouter une gestion des erreurs dans l'UI
    } finally {
      this.isLoading = false;
    }
  }

  private translateRecommendation(rec: string): string {
    switch (rec) {
      case 'BUY': return 'ACHETER';
      case 'SELL': return 'VENDRE';
      case 'HOLD': return 'CONSERVER';
      default: return rec;
    }
  }
}