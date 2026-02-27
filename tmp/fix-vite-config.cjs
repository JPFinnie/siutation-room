const fs = require('fs');

let c = fs.readFileSync('vite.config.ts', 'utf8');

c = c.replace(/async function buildRouter\(\) \{[\s\S]*?import\('\.\/server\/worldmonitor\/trade\/v1\/handler'\),\s*\]\);[\s\S]*?const allRoutes = \[[\s\S]*?\];\s*cachedCorsMod = corsMod;\s*return routerMod\.createRouter\(allRoutes\);\s*\}/, `async function buildRouter() {
    const [
      routerMod, corsMod, errorMod,
      predictionServerMod, predictionHandlerMod,
      economicServerMod, economicHandlerMod,
      marketServerMod, marketHandlerMod,
      newsServerMod, newsHandlerMod,
      tradeServerMod, tradeHandlerMod,
    ] = await Promise.all([
        import('./server/router'),
        import('./server/cors'),
        import('./server/error-mapper'),
        import('./src/generated/server/worldmonitor/prediction/v1/service_server'),
        import('./server/worldmonitor/prediction/v1/handler'),
        import('./src/generated/server/worldmonitor/economic/v1/service_server'),
        import('./server/worldmonitor/economic/v1/handler'),
        import('./src/generated/server/worldmonitor/market/v1/service_server'),
        import('./server/worldmonitor/market/v1/handler'),
        import('./src/generated/server/worldmonitor/news/v1/service_server'),
        import('./server/worldmonitor/news/v1/handler'),
        import('./src/generated/server/worldmonitor/trade/v1/service_server'),
        import('./server/worldmonitor/trade/v1/handler'),
      ]);

    const serverOptions = { onError: errorMod.mapErrorToResponse };
    const allRoutes = [
      ...predictionServerMod.createPredictionServiceRoutes(predictionHandlerMod.predictionHandler, serverOptions),
      ...economicServerMod.createEconomicServiceRoutes(economicHandlerMod.economicHandler, serverOptions),
      ...marketServerMod.createMarketServiceRoutes(marketHandlerMod.marketHandler, serverOptions),
      ...newsServerMod.createNewsServiceRoutes(newsHandlerMod.newsHandler, serverOptions),
      ...tradeServerMod.createTradeServiceRoutes(tradeHandlerMod.tradeHandler, serverOptions),
    ];
    cachedCorsMod = corsMod;
    return routerMod.createRouter(allRoutes);
  }`);

fs.writeFileSync('vite.config.ts', c);
