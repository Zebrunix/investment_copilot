import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { analyzeNasdaqOpportunities } from './nasdaqAnalyzer';
import { analyzeWeeklyOpportunities } from './weeklyAnalyzer';
import { analyzeCryptoOpportunities } from './cryptoAnalyzer';

dotenv.config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function generateDailyReport() {
  try {
    // Récupération des meilleures opportunités
    const [nasdaqOpp, cacOpp, cryptoOpp] = await Promise.all([
      analyzeNasdaqOpportunities(),
      analyzeWeeklyOpportunities(),
      analyzeCryptoOpportunities()
    ]);

    // Sélection des 5 meilleures opportunités pour chaque catégorie
    const topNasdaq = nasdaqOpp.slice(0, 5);
    const topCAC = cacOpp.slice(0, 5);
    const topCrypto = cryptoOpp.slice(0, 5);

    // Génération du contenu HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .section { margin-bottom: 30px; }
            .title { color: #2563eb; font-size: 24px; margin-bottom: 15px; }
            .opportunity { 
              background: #f8fafc;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 8px;
            }
            .buy { color: #16a34a; }
            .sell { color: #dc2626; }
            .hold { color: #ca8a04; }
          </style>
        </head>
        <body>
          <h1 style="color: #1e40af;">Résumé Quotidien des Opportunités d'Investissement</h1>
          <p>Voici les meilleures opportunités d'investissement pour aujourd'hui :</p>

          <div class="section">
            <h2 class="title">NASDAQ</h2>
            ${topNasdaq.map(stock => `
              <div class="opportunity">
                <h3>${stock.companyName} (${stock.symbol})</h3>
                <p class="${getRecommendationClass(stock.confidence)}">
                  Recommandation: ${getRecommendation(stock.confidence)}
                </p>
                <p>Prix actuel: ${stock.currentPrice.toFixed(2)}€</p>
                <p>Score de confiance: ${stock.confidence}%</p>
                <p>Points clés:</p>
                <ul>
                  ${stock.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2 class="title">CAC 40</h2>
            ${topCAC.map(stock => `
              <div class="opportunity">
                <h3>${stock.companyName} (${stock.symbol})</h3>
                <p class="${getRecommendationClass(stock.confidence)}">
                  Recommandation: ${getRecommendation(stock.confidence)}
                </p>
                <p>Prix actuel: ${stock.currentPrice.toFixed(2)}€</p>
                <p>Score de confiance: ${stock.confidence}%</p>
                <p>Points clés:</p>
                <ul>
                  ${stock.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2 class="title">Cryptomonnaies</h2>
            ${topCrypto.map(crypto => `
              <div class="opportunity">
                <h3>${crypto.name} (${crypto.symbol})</h3>
                <p class="${getRecommendationClass(crypto.confidence)}">
                  Recommandation: ${getRecommendation(crypto.confidence)}
                </p>
                <p>Prix actuel: ${crypto.currentPrice.toFixed(2)}€</p>
                <p>Score de confiance: ${crypto.confidence}%</p>
                <p>Points clés:</p>
                <ul>
                  ${crypto.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <p style="color: #64748b; font-size: 12px;">
            Ces recommandations sont basées sur une analyse technique et fondamentale automatisée.
            Elles ne constituent pas des conseils en investissement. Effectuez toujours vos propres recherches.
          </p>
        </body>
      </html>
    `;

    // Envoi de l'email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT,
      subject: '📈 Résumé Quotidien des Opportunités d\'Investissement',
      html: htmlContent
    });

    console.log('Email de notification envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
}

// Fonction utilitaire pour déterminer la classe CSS de la recommandation
function getRecommendationClass(confidence: number): string {
  if (confidence >= 70) return 'buy';
  if (confidence <= 30) return 'sell';
  return 'hold';
}

// Fonction utilitaire pour obtenir la recommandation
function getRecommendation(confidence: number): string {
  if (confidence >= 70) return 'ACHETER';
  if (confidence <= 30) return 'VENDRE';
  return 'CONSERVER';
}

// Planification de l'envoi quotidien à 8h du matin
cron.schedule('0 8 * * *', () => {
  console.log('Démarrage de la génération du rapport quotidien...');
  generateDailyReport();
});