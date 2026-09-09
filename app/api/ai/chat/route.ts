import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  searchProducts,
  getProductInventoryDetails,
  getStorePolicyAnswer,
  ProductSearchParams,
} from '@/lib/ai-search';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], currentProductId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message field is required' },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();
    const lowerMsg = trimmedMsg.toLowerCase();

    // 1. Check for Store Policy Queries first
    const policyAnswer = getStorePolicyAnswer(trimmedMsg);
    if (policyAnswer) {
      return NextResponse.json({
        message: policyAnswer,
        product_ids: [],
        suggested_questions: [
          'Show me new arrivals',
          'Find a wedding outfit under ₹5,000',
          'What is your shipping policy?',
        ],
      });
    }

    // Check for general policy questions not configured in project
    if (
      lowerMsg.includes('policy') ||
      lowerMsg.includes('warranty') ||
      lowerMsg.includes('store hours') ||
      lowerMsg.includes('location') ||
      lowerMsg.includes('franchise') ||
      lowerMsg.includes('store hours in')
    ) {
      return NextResponse.json({
        message: "I don't have that store information available currently.",
        product_ids: [],
        suggested_questions: ['What is your return policy?', 'How much is shipping?'],
      });
    }

    // 2. Check for Specific Product Questions (if currentProductId or product reference)
    if (
      currentProductId ||
      lowerMsg.includes('is this available') ||
      lowerMsg.includes('in stock') ||
      lowerMsg.includes('what colors') ||
      lowerMsg.includes('how much does this cost')
    ) {
      let targetId = currentProductId;

      // If no explicit currentProductId, check history
      if (!targetId && history.length > 0) {
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].product_ids && history[i].product_ids.length > 0) {
            targetId = history[i].product_ids[0];
            break;
          }
        }
      }

      if (targetId) {
        const details = await getProductInventoryDetails(targetId);
        if (details) {
          const { product, variants } = details;

          // Question: "Is this available in size X?"
          const sizeMatch = lowerMsg.match(/available in\s+([a-z0-9]+)/i) || lowerMsg.match(/size\s+([a-z0-9]+)/i);
          if (sizeMatch) {
            const requestedSize = sizeMatch[1].toUpperCase();
            const matchingVariant = variants.find(
              (v) => v.size.toUpperCase() === requestedSize
            );

            if (matchingVariant && matchingVariant.quantity > 0) {
              return NextResponse.json({
                message: `Yes! "${product.name}" is currently IN STOCK in size ${requestedSize} (${matchingVariant.quantity} units available).`,
                product_ids: [product.id],
                suggested_questions: ['What colors are available?', 'Show me similar items'],
              });
            } else {
              const inStockSizes = variants
                .filter((v) => v.quantity > 0)
                .map((v) => v.size);
              const sizeList = inStockSizes.length > 0 ? inStockSizes.join(', ') : 'None';
              return NextResponse.json({
                message: `Sorry, "${product.name}" is currently OUT OF STOCK in size ${requestedSize}. Available in-stock sizes: ${sizeList}.`,
                product_ids: [product.id],
                suggested_questions: ['Show me other sizes', 'Show similar products'],
              });
            }
          }

          // Question: "What colors are available?"
          if (lowerMsg.includes('color')) {
            const colors = Array.from(new Set(variants.map((v) => v.color)));
            return NextResponse.json({
              message: `"${product.name}" is available in the following colors: ${colors.join(', ')}.`,
              product_ids: [product.id],
              suggested_questions: ['Is size M in stock?', 'How much does it cost?'],
            });
          }

          // Question: "How much does this cost?"
          if (lowerMsg.includes('cost') || lowerMsg.includes('price')) {
            return NextResponse.json({
              message: `"${product.name}" is priced at ₹${Number(product.price).toLocaleString('en-IN')}${
                product.compare_at_price ? ` (reduced from ₹${Number(product.compare_at_price).toLocaleString('en-IN')})` : ''
              }.`,
              product_ids: [product.id],
              suggested_questions: ['Is size S available?', 'What is it made of?'],
            });
          }

          // Question: "Which size is currently in stock?"
          if (lowerMsg.includes('in stock') || lowerMsg.includes('which size')) {
            const inStock = variants.filter((v) => v.quantity > 0);
            if (inStock.length > 0) {
              const list = inStock.map((v) => `${v.color} / ${v.size} (${v.quantity} in stock)`).join(', ');
              return NextResponse.json({
                message: `Current in-stock variants for "${product.name}": ${list}.`,
                product_ids: [product.id],
                suggested_questions: ['Is size M in stock?'],
              });
            } else {
              return NextResponse.json({
                message: `Currently, all variants for "${product.name}" are sold out.`,
                product_ids: [product.id],
                suggested_questions: ['Show me similar items'],
              });
            }
          }
        }
      }
    }

    // 3. Extract Search Intent Parameters for Catalog Queries
    const searchParams: ProductSearchParams = {
      limit: 6,
    };

    // Price Filter
    const priceMatch = lowerMsg.match(/(?:under|below|less than|max|within)\s*(?:₹|rs\.?|rupees)?\s*(\d[\d,]*)/i);
    if (priceMatch) {
      const parsedPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsedPrice)) {
        searchParams.maxPrice = parsedPrice;
      }
    }

    // Category Filter
    if (lowerMsg.includes('saree')) searchParams.category = 'Sarees';
    else if (lowerMsg.includes('lehenga')) searchParams.category = 'Lehengas';
    else if (lowerMsg.includes('anarkali')) searchParams.category = 'Anarkalis';
    else if (lowerMsg.includes('bridal') || lowerMsg.includes('couture')) searchParams.category = 'Bridal Couture';
    else if (lowerMsg.includes('kurti') || lowerMsg.includes('suit')) searchParams.category = 'Kurtis & Suits';
    else if (lowerMsg.includes('dupatta') || lowerMsg.includes('stole')) searchParams.category = 'Dupattas & Stoles';

    // Color Filter
    const colorsList = ['black', 'maroon', 'ivory', 'gold', 'red', 'green', 'blue', 'pink', 'yellow', 'purple', 'emerald'];
    for (const c of colorsList) {
      if (lowerMsg.includes(c)) {
        searchParams.color = c;
        break;
      }
    }

    // Size Filter
    const sizeMatches = lowerMsg.match(/\b(xs|s|m|l|xl|free size)\b/i);
    if (sizeMatches) {
      searchParams.size = sizeMatches[1].toUpperCase();
    }

    // Keywords / Style
    if (lowerMsg.includes('wedding')) searchParams.query = 'wedding';
    else if (lowerMsg.includes('pastel')) searchParams.query = 'pastel';
    else if (lowerMsg.includes('traditional')) searchParams.query = 'traditional';
    else if (lowerMsg.includes('festive') || lowerMsg.includes('dinner')) searchParams.query = 'festive';
    else if (lowerMsg.includes('silk')) searchParams.query = 'silk';
    else if (lowerMsg.includes('chiffon')) searchParams.query = 'chiffon';
    else if (lowerMsg.includes('dress')) searchParams.query = 'dress';
    else if (lowerMsg.includes('helmet') || lowerMsg.includes('robot') || lowerMsg.includes('shoes')) {
      searchParams.query = lowerMsg; // Explicit unknown non-apparel item
    }

    // Execute strict database search
    const finalProducts = await searchProducts(searchParams);

    // 4. Handle No-Match Scenario
    if (finalProducts.length === 0) {
      return NextResponse.json({
        message: "Sorry, I couldn't find anything matching those requirements in our boutique catalog.",
        product_ids: [],
        suggested_questions: [
          'Show me all sarees',
          'Show me products under ₹5,000',
          'Show me festive outfits',
        ],
      });
    }

    const validatedProductIds = finalProducts.map((p) => p.id);

    // 5. Construct AI Response Summary
    let responseText = '';
    if (searchParams.maxPrice) {
      responseText = `I found ${finalProducts.length} option${finalProducts.length > 1 ? 's' : ''} matching your price filter under ₹${searchParams.maxPrice.toLocaleString('en-IN')}:`;
    } else if (searchParams.category) {
      responseText = `Here are our finest ${searchParams.category} selections crafted for you:`;
    } else if (searchParams.query) {
      responseText = `Here are curated ${searchParams.query} outfits from our MIRĀYA collection:`;
    } else {
      responseText = `Here are recommendations tailored to your request:`;
    }

    // Optional Gemini LLM Enhancement if Key Available
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are MIRĀYA's luxury AI fashion assistant.
User request: "${trimmedMsg}".
Database search returned ${finalProducts.length} actual products: ${JSON.stringify(
          finalProducts.map((p) => ({ name: p.name, price: p.price, fabric: p.fabric, collection: p.collection }))
        )}.

Provide a warm, elegant 2-sentence summary introducing these matching products.
Do NOT invent any other products or change prices.`;

        const result = await model.generateContent(prompt);
        const aiSummary = result.response.text();
        if (aiSummary && aiSummary.trim()) {
          responseText = aiSummary.trim();
        }
      } catch (geminiErr) {
        console.error('Gemini API call warning (using DB summary):', geminiErr);
      }
    }

    return NextResponse.json({
      message: responseText,
      product_ids: validatedProductIds,
      suggested_questions: [
        'Is size M available?',
        'What colors are in stock?',
        'What is your return policy?',
      ],
    });
  } catch (err: any) {
    console.error('Server error in AI chat route:', err);
    return NextResponse.json(
      { message: "I'm having trouble processing your request right now. Please try again.", product_ids: [] },
      { status: 500 }
    );
  }
}
