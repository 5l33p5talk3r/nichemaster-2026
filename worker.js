/** NicheMaster 2026 - Cloudflare Worker API */
export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname;
    const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
    if (request.method === 'OPTIONS') return new Response(null,{headers:cors});
    try {
      if (path === '/api/health') return json({status:'ok',service:'nichemaster-2026',ebooks:1785,timestamp:new Date().toISOString()},cors);
      if (path === '/api/books') {
        const page=Math.max(parseInt(url.searchParams.get('page')||'1',10),1), limit=Math.min(Math.max(parseInt(url.searchParams.get('limit')||'24',10),1),100);
        return json({page,limit,total:1785,filters:{niche:url.searchParams.get('niche'),query:(url.searchParams.get('q')||'').toLowerCase()},message:'Full book data lives in the storefront.'},cors);
      }
      if (path === '/api/search') return json({query:(url.searchParams.get('q')||'').toLowerCase(),niche:url.searchParams.get('niche')?parseInt(url.searchParams.get('niche'),10):null,newOnly:url.searchParams.get('new')==='true',total:1785,results:[]},cors);
      if (path.startsWith('/api/book/')) {
        const id=Number(path.split('/').pop());
        if (!Number.isInteger(id)) return json({error:'Invalid book ID'},cors,400);
        return json({id,found:true,formats:['md','epub','html'],downloadUrl:'/downloads/'},cors);
      }
      if (path === '/api/wishlist' && request.method === 'POST') {
        const body=await request.json().catch(()=>({})), userId=body.userId||'anonymous', bookIds=Array.isArray(body.bookIds)?body.bookIds:[];
        if (env.NICHEMASTER_KV && userId!=='anonymous') await env.NICHEMASTER_KV.put(`wishlist:${userId}`,JSON.stringify(bookIds));
        return json({success:true,userId,bookIds,persisted:Boolean(env.NICHEMASTER_KV&&userId!=='anonymous')},cors);
      }
      if ((path === '/api/purchase' || path === '/api/purchases') && request.method === 'POST') {
        if (!env.NICHEMASTER_DB) return json({error:'D1 is not configured'},cors,503);
        const purchase=await request.json().catch(()=>null);
        if (!purchase||!purchase.book_id||!purchase.user_email||!Number.isInteger(purchase.amount_cents)||!purchase.payment_id) return json({error:'book_id, user_email, amount_cents, and payment_id are required'},cors,400);
        try {
          await env.NICHEMASTER_DB.prepare('INSERT INTO purchases (book_id,user_email,amount_cents,currency,payment_id,status) VALUES (?,?,?,?,?,?)').bind(purchase.book_id,purchase.user_email,purchase.amount_cents,purchase.currency||'USD',purchase.payment_id,purchase.status||'completed').run();
        } catch { return json({error:'Purchase could not be recorded'},cors,409); }
        return json({success:true,orderId:`NM-${purchase.payment_id}`,redirect:'/thank-you.html'},cors,201);
      }
      if (path === '/api/stats') return json({totalEbooks:1785,niches:10,formats:3,lastUpdated:'2026-08-09',features:['product-pages','covers','paypal','wishlist','new-arrivals']},cors);
      return json({name:'NicheMaster 2026 API',version:'1.1.0',endpoints:['/api/health','/api/books','/api/search','/api/book/:id','/api/wishlist','/api/purchase','/api/stats']},cors,404);
    } catch { return json({error:'Internal server error'},cors,500); }
  }
};
function json(data,headers={},status=200){return new Response(JSON.stringify(data,null,2),{status,headers:{'Content-Type':'application/json',...headers}});}
