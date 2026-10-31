# Storefront E-commerce QA ও 100k Concurrent Readiness Report

**পরীক্ষার তারিখ:** 2026-10-29  
**প্রকল্প:** BOED Fashion storefront  
**সামগ্রিক সিদ্ধান্ত:** **একসঙ্গে 100,000 ব্যবহারকারী সামলানোর সক্ষমতা certify করা যাচ্ছে না।** সীমিত কিছু পরীক্ষা পাস করেছে, কিন্তু এই environment-এ সম্পূর্ণ storefront release gate বা বাস্তব load test চালানো সম্ভব হয়নি।

## সংক্ষিপ্ত ফলাফল

Catalog mapping ও cart behavior-এর কিছু স্বয়ংক্রিয় পরীক্ষা আছে এবং TypeScript ও ESLint checks পাস করেছে। তবে project-এর নির্ধারিত e-commerce verification command test চালু হওয়ার আগেই থেমে যায়—কারণ এটি tracked `tests/` directory-তে নেই এমন একটি test file ব্যবহার করে। Browser-ভিত্তিক end-to-end test বা server-side load test-ও চালানো হয়নি: local app চালু ছিল না, load-test tooling নেই, এবং deployment/database capacity ও বাস্তব traffic profile জানা নেই।

অতএব, এই যাচাই থেকে **storefront 100,000 simultaneous user সামলাতে পারবে—এমন সিদ্ধান্ত প্রমাণিত হয়নি**। আবার পারবে না, সেটিও প্রমাণিত নয়; সক্ষমতা এখনো মাপা হয়নি। নিচের staging test plan production-সমমানের infrastructure-এ পাস না করা পর্যন্ত 100k capacity দাবি করা বা তার ওপর নির্ভর করা উচিত নয়।

## পরীক্ষার পরিধি ও প্রমাণ

Storefront, catalog, product, cart, order, cache, database client, deployment config, test scripts এবং tracked test files পর্যালোচনা করা হয়েছে। Production endpoint-এ request পাঠানো হয়নি, বাস্তব payment শুরু করা হয়নি, এবং database-এ load তৈরি করা হয়নি।

| পরীক্ষা | ফলাফল | প্রমাণ |
|---|---|---|
| TypeScript | **PASS** | `npm run typecheck` সফলভাবে শেষ হয়েছে। |
| ESLint | **PASS, warning আছে** | `npm run lint` সফলভাবে শেষ হয়েছে। `front_End/layout.tsx`-এ `<head>` element এবং custom font নিয়ে ২টি warning এসেছে। |
| বিদ্যমান catalog/cart tests | **PASS — ১৩/১৩** | সরাসরি Node test চালিয়ে `cart-stock-fallback`, `cart-reconciliation`, `boed-catalog`, এবং `boed-categories` পাস করেছে। |
| নির্ধারিত e-commerce verification | **BLOCKED** | `npm run verify:products` শুরুতেই থেমেছে; `tests/phase0-security.test.mjs` অনুপস্থিত। Tracked `tests/` directory-তে মোট ৬টি test file আছে; package scripts-এ উল্লেখিত এই file ও storefront suite-গুলো নেই। |
| Browser end-to-end test | **চালানো হয়নি** | Port 3000/3001-এ কোনো local app চালু ছিল না; তাই UI navigation ও বাস্তব API flow যাচাই করা যায়নি। |
| Database-সহ checkout test | **চালানো হয়নি** | App/database test session পাওয়া যায়নি। কোনো order বা payment তৈরি হয়নি। |
| Concurrent/load test | **চালানো হয়নি** | Load-test tool বা নির্ধারিত load-test target পাওয়া যায়নি। Production বা বাইরের server-এ কোনো traffic পাঠানো হয়নি। |

উপরের ফলাফল এই checkout এবং নির্দিষ্ট command-গুলোর জন্য প্রযোজ্য; এগুলো production uptime বা capacity measurement নয়।

## 100k ব্যবহারকারীর দাবিতে প্রভাব ফেলে এমন বিষয়

### ১. Public catalog caching সহায়ক, কিন্তু capacity-র প্রমাণ নয়

Storefront home, product detail, catalog facets এবং catalog data-র জন্য Next.js caching ব্যবহৃত হয়েছে। Public API response-এ CDN `s-maxage` ও stale-while-revalidate header দেওয়ার ব্যবস্থাও আছে। Deployed CDN/cache সঠিকভাবে configured এবং cache-hit ratio বেশি হলে public browsing-এর repeated database read কমতে পারে।

তবে cache behavior, hit ratio, cold-cache burst, invalidation behavior বা deployed CDN config মাপা হয়নি। Catalog search এবং আলাদা filter combination-এ ভিন্ন cache key তৈরি হতে পারে এবং জনপ্রিয় cached page-এর তুলনায় বেশি database কাজ লাগতে পারে।

### ২. Cart ও checkout ব্যক্তিগত database workload

Cart ও checkout request private এবং `no-store`; এগুলো shopper-কে authenticate করে এবং user-specific data পড়ে বা লেখে। Cart GET path-এ cart reminder মূল্যায়ন এবং category/product/cart data পড়াও হয়। তাই public product page-এর মতো CDN offload ধরে নেওয়া যাবে না। Sale বা checkout-এর সময় একসঙ্গে বেশি traffic এলে database connection, query latency, inventory contention, এবং payment-provider latency মাপা জরুরি।

### ৩. Database connection capacity repository থেকে নিশ্চিত নয়

প্রতিটি server process-এ Prisma client reuse করা হয়। কিন্তু production database-এর connection limit, serverless instance সংখ্যা, connection-pooler config বা database compute capacity repository-তে নির্ধারিত নয়। Serverless horizontal scaling হলে process-প্রতি connection-এর সংখ্যা একাধিক instance জুড়ে গুণিত হতে পারে; deployment ও database limit একসঙ্গে যাচাই করতে হবে।

### ৪. Production rate-limit config যাচাই করা জরুরি

Production-এ rate-limit implementation-এর জন্য Upstash Redis credential দরকার; distributed rate limiting configured না থাকলে এটি error দেয়। Per-instance memory-কে distributed limiter ধরে নেওয়ার চেয়ে এটি নিরাপদ, কিন্তু যে endpoint-গুলো limiter ব্যবহার করে সেগুলোর production config ও Redis availability নিশ্চিত করতে হবে। এই যাচাইয়ে deployment secret দেখা বা Redis config নিশ্চিত করা হয়নি।

## Readiness সিদ্ধান্ত

| ক্ষেত্র | মূল্যায়ন |
|---|---|
| Static/type correctness | **চালানো check অনুযায়ী গ্রহণযোগ্য** |
| এই checkout-এ থাকা catalog/cart unit test | **সীমিত, তবে পাস** |
| পূর্ণ storefront regression confidence | **যথেষ্ট নয় — নির্ধারিত test gate অসম্পূর্ণ/চালানো যায়নি** |
| Browser ও checkout acceptance | **যাচাই হয়নি** |
| 100,000 concurrent-user capacity | **যাচাই হয়নি; certify করার প্রমাণ নেই** |

**Release সুপারিশ:** এই ফলাফলের ভিত্তিতে 100k concurrency-র প্রতিশ্রুতি দেবেন না। প্রথমে missing/renamed test suite ঠিক করুন, তারপর production-সমমানের staging environment-এ browser, database-backed flow এবং staged load test চালান।

## পেশাদার validation plan

1. **Test gate ঠিক করুন।** `test:products`-এ উল্লেখ করা missing test path restore বা সংশোধন করুন; প্রতিটি referenced file tracked আছে এবং পুরো command শেষ হয়—নিশ্চিত করুন।
2. **আলাদা staging environment প্রস্তুত করুন।** Production-সমমানের app settings, database schema ও index, connection pooler, Redis, CDN/cache, image storage এবং payment sandbox ব্যবহার করুন। Synthetic customer/catalog/order ব্যবহার করুন; production customer বা payment data নয়।
3. **আগে কম traffic-এ critical journey যাচাই করুন।** Home, search/filter/pagination, product detail/variant, login, cart update, shipping/tax quote, checkout, order confirmation এবং inventory contention পরীক্ষা করুন। Payment sandbox ও order idempotency যাচাই করুন; বাস্তব charge করবেন না।
4. **ধাপে ধাপে traffic বাড়ান।** Distributed load generator দিয়ে 100, 500, 1,000, 5,000 এবং 10,000 virtual user-এ ধাপে ধাপে যান। আগের stage স্থিতিশীল এবং staging owner অনুমোদন দিলেই আরও বাড়িয়ে 100,000-এ যান। বাস্তবসম্মত think time এবং cached browse, ভিন্ন search, cart read/write ও checkout-এর নথিভুক্ত traffic mix ব্যবহার করুন—একটি cached URL-এ একই request বারবার নয়।
5. **Test শুরুর আগে pass/fail SLO ঠিক করুন।** প্রাথমিক লক্ষ্য হতে পারে: public cached page/API p95 ≤ 500 ms; dynamic catalog p95 ≤ 1 s; cart/checkout API p95 ≤ 2 s (বাইরের payment-provider সময় বাদে); 5xx rate < 0.1%; order হারানো/duplicate বা oversold inventory শূন্য; এবং database/Redis নির্ধারিত connection, CPU, memory ও saturation limit-এর নিচে। Business SLO ও measured regional latency অনুযায়ী এই লক্ষ্য ঠিক করুন।
6. **প্রতিটি stage-এর evidence সংরক্ষণ করুন।** Virtual user, request rate, cache-hit ratio, p50/p95/p99 latency, timeout/5xx, app CPU/memory/instance count, database active/max connection ও slow query, lock wait, Redis latency/error, এবং payment sandbox latency নথিভুক্ত করুন। Error, saturation, inventory integrity বা খরচের guardrail অতিক্রম করলে test থামান।
7. **স্পষ্ট অনুমতি ও নিরাপত্তা ব্যবস্থা ছাড়া 100k test চালাবেন না।** নির্ধারিত staging window, একাধিক load generator, provider-approved traffic limit, alerting, abort-এর দায়িত্বপ্রাপ্ত ব্যক্তি এবং cleanup plan রাখুন। লিখিত অনুমতি ছাড়া production বা তৃতীয় পক্ষের service-এ high-volume test করবেন না।

## দেখা files ও commands

- E-commerce test scripts: `package.json` (`test:products`, `verify:products`)
- বিদ্যমান test: `tests/cart-stock-fallback.test.mjs`, `tests/cart-reconciliation.test.mjs`, `tests/boed-catalog.test.mjs`, `tests/boed-categories.test.mjs`
- Storefront caching ও public cache headers: `lib/storefront-home.ts`, `lib/storefront-catalog.ts`, `lib/storefront-product-detail.ts`, `lib/public-cache.ts`
- ব্যক্তিগত cart path: `app/api/cart/route-core.ts`
- Database client ও rate limiting: `lib/prisma.ts`, `lib/request-security.ts`
- Deployment build config: `vercel.json`
