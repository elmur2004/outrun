// OUTRUN storefront prototype — router, i18n, sections, cart, motion.
// Every <section data-section="…"> maps 1:1 to a Shopify OS 2.0 section file (see SCHEMA at the bottom).

/* ================= state ================= */
const store = { get(k, d) { try { const v = localStorage.getItem('or_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem('or_' + k, JSON.stringify(v)); } catch {} } };
const prefersCalm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {
  lang: store.get('lang', 'en'), calm: store.get('calm', prefersCalm), dev: false,
  cart: store.get('cart', []), edition: 'signature', finish: 'gloss', make: '', model: '', customImg: null, customURL: '', gift: false,
  filters: { make: 'all', edition: 'all', finish: 'all' }, thumbs: null,
};
const PRICE = { street: 3200, signature: 3200, custom: 3900, gift: 250 }; // EGP placeholders
const STOCK = { run: 120, left: 37 }; // placeholder: wire to variant inventory_quantity
const WA = '201000000000'; const PHONE = '+20 100 000 0000'; // placeholders
const MODELS = { mercedes: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'GLA', 'GLC', 'GLE'], bmw: ['1 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5'], mg: ['MG4', 'MG5', 'MG6', 'ZS', 'HS', 'RX5'] };
const MAKES = ['mercedes', 'bmw', 'mg'];
const MAKE_NAME = { mercedes: 'Mercedes', bmw: 'BMW', mg: 'MG' };
const EDS = ['street', 'signature', 'custom'], FINS = ['gloss', 'steel', 'ice'];
const FIN_SW = { gloss: 'radial-gradient(circle at 35% 30%,#3a4450,#0c0f13 60%)', steel: 'radial-gradient(circle at 35% 30%,#a9bccb,#5d7486 60%,#34434f)', ice: 'radial-gradient(circle at 35% 30%,#fff,#d3e2ec 50%,#8fa7b8)' };

/* ================= i18n ================= */
const T = {
en: {
  nav_shop: 'Shop', nav_made: 'Made Here', nav_next: 'Coming next', nav_support: 'Warranty & FAQ', menu: 'Menu', close: 'Close',
  hero_eyebrow: 'Drop 01 · Floating center caps', hero_sub: 'The wheel spins. The logo stays still. Floating center caps, finished to the smallest detail, in a limited run.',
  cta_shop: 'Shop the drop', cta_fit: 'Find your fit', scroll: 'Scroll', run: 'Run 01 · Limited',
  st1: 'The wheel spins. The logo stays still.', st1s: 'A sealed bearing and a counterweight keep the face level at any speed.',
  st2s: 'Four parts. Every edge checked by hand.', st3: 'Finished to the smallest detail.', st4s: 'Always ahead. Always noticed.',
  p_plate: 'Emblem plate', p_plate_s: 'Your edition’s face', p_shell: 'Shell', p_shell_s: 'Machined, finished by hand', p_bearing: 'Sealed bearing', p_bearing_s: 'Lets the face turn free', p_weight: 'Counterweight', p_weight_s: 'Keeps the logo upright',
  ed_eyebrow: 'Three editions', ed_h: 'Pick the face that rides with you.', ed_lead: 'Same floating build. Three faces. Hover or tap a cap to bring it forward.',
  street: 'Street', signature: 'Signature', custom: 'Custom',
  street_s: 'Your car’s own badge, floating level.', ed_k1: 'Launch', ed_k2: 'Launch', ed_k3: 'On request', signature_s: 'The OUTRUN symbol. Two speed lines.', custom_s: 'Your design, cut and finished for your wheels.',
  shop_ed: 'Shop {e}', fit_eyebrow: 'Find your fit', fit_h: 'Made to the millimetre for your car.', fit_lead: 'Mercedes, BMW and MG at launch. Anything else, we make in about a day.',
  make: 'Make', model: 'Model', other: 'Other', pick_make: 'Pick your make', pick_model: 'Pick your model',
  fit_ready: 'Fits your {m}', fit_ready_s: 'Set of 4, sized for the {m}. Clips straight into the original hub.', fit_shop: 'Shop for my {m}',
  fit_wait: 'Your car, your fit.', fit_wait_s: 'Choose a make and model to see your set.',
  other_h: 'Don’t see your car?', other_s: 'We make it in about a day. Send us your car and wheel on WhatsApp.', other_ph: 'e.g. Audi A4 2020', wa_cta: 'Request on WhatsApp',
  reels_eyebrow: 'On real cars', reels_h: 'Performance looks better here.', reels_lead: 'Customer videos, filmed on their own cars. Hover or tap to play.', reel_slot: 'Customer clip', tap: 'Tap to play',
  craft_eyebrow: 'The craft', craft_h: 'Crafted in our own workshop.', craft_lead: 'Shown, never shouted.', craft_more: 'Inside the workshop',
  c1: 'Design', c1s: 'Every piece starts in CAD.', c2: 'Build', c2s: 'In-house, in small runs.', c3: 'Finish', c3s: 'Every edge checked by hand.', c4: 'Test', c4s: 'Real heat, real roads, real use.',
  tr1: 'Open before you pay', tr1s: 'Cash on delivery. Inspect the set first.', tr2: 'Easy exchange', tr2s: 'If it doesn’t fit, we swap it.', tr3: 'Clear warranty', tr3s: 'If it falls off, we replace it.', tr4: 'Real people', tr4s: 'Phone, WhatsApp and a real workshop.',
  next_eyebrow: 'One name. Three lines.', next_h: 'Car is live. Ride and Kart are next.', next_lead: 'Lines open in order, never all at once.',
  ride: 'Ride', ride_s: 'E-scooters, e-skateboards and hoverboards.', kart: 'Kart', kart_s: 'Electric fun karts.', phase2: 'Phase two', phase3: 'Phase three', notify: 'Notify me',
  gift_eyebrow: 'The gift box', gift_h: 'A set of four, boxed like a launch.', gift_s: 'Foam-set caps in a navy box that opens slowly. For Valentine’s, birthdays and Eid.', gift_add: 'Add gift box', occ1: 'Valentine’s', occ2: 'Birthdays', occ3: 'Eid',
  foot_shop: 'Shop', foot_help: 'Help', foot_talk: 'Talk to us', foot_tag: 'Exclusive pieces, finished to the smallest detail, that put drivers and riders ahead.',
  calm: 'Calm motion', dev: 'Shopify sections', lang_btn: 'العربية', wa: 'WhatsApp', phone: 'Phone', workshop: 'Workshop', workshop_addr: 'Workshop address · Cairo (placeholder)', hours: 'Replies within the hour, 10:00–22:00', copy: 'Copy', copied: 'Copied',
  col_eyebrow: 'OUTRUN Car', col_h: 'Floating center caps.', col_lead: 'Three editions, three finishes. Every set fits Mercedes, BMW and MG at launch.',
  f_make: 'Make', f_ed: 'Edition', f_fin: 'Finish', all: 'All', gloss: 'Gloss Black', steel: 'Satin Steel', ice: 'Ice Chrome',
  set4: 'Set of 4', made_day: 'Made in about a day', in_run: 'In the run', no_match: 'Nothing matches. Clear a filter.', clear: 'Clear filters', drag360: '360°', gift_box: 'Gift box', gift_box_s: 'Navy box, foam set, gift card',
  pdp_eyebrow: 'OUTRUN Car · Drop 01', pdp_h: 'Floating Center Caps', pdp_lead: 'The wheel spins. The logo stays still. A sealed bearing and a counterweight keep the face level at any speed.',
  stock_l: '{n} of {t} sets left in Run 01', stock_r: 'Limited run', edition: 'Edition', finish: 'Finish', fitment: 'Fitment', choose: 'Choose',
  upload_h: 'Upload your design', upload_s: 'PNG or SVG, high contrast. We send a proof on WhatsApp before we cut.', upload_btn: 'Choose file', upload_drop: 'or drop it here', upload_done: 'On the cap. Drag the viewer to see it.',
  gift_opt: 'Add the gift box', add: 'Add to cart', added: 'Added. Your set is in the cart.', need_fit: 'Pick your make and model first, so we send the right fit.',
  spin: 'Spin the wheel', drag: 'Drag to rotate', live: 'Self-leveling, live',
  sp1: 'Fits', sp1s: 'Mercedes · BMW · MG at launch', sp2: 'Set', sp2s: '4 caps + clips', sp3: 'Build', sp3s: 'Shell, sealed bearing, counterweight, emblem plate', sp4: 'Request', sp4s: 'Any other car in about a day',
  faq_eyebrow: 'Questions', faq_h: 'Straight answers.',
  q1: 'How does the cap stay level?', a1: 'A sealed bearing lets the face turn free of the wheel. A counterweight under the emblem keeps it upright, so the logo reads level at any speed.',
  q2: 'Will it fit my car?', a2: 'Mercedes, BMW and MG fit at launch. Pick your model and we send the matching size. Not listed? Send us your car on WhatsApp and we make it in about a day.',
  q3: 'How do I pay?', a3: 'Cash on delivery. Open the box, check the set, then pay the courier.',
  q4: 'What if it doesn’t fit?', a4: 'We swap it. Message us on WhatsApp with a photo and we arrange the exchange.',
  q5: 'What if a cap falls off?', a5: 'We replace it. That is the warranty, in one line.',
  q6: 'Can I send it as a gift?', a6: 'Yes. Add the gift box at checkout and include a note for the card.',
  q7: 'What file do I need for Custom?', a7: 'A PNG or SVG with clear edges works best. We send a proof on WhatsApp before we make your set.',
  q8: 'How long is delivery?', a8: 'Delivery times by city show at checkout. Custom and on-request sets add about a day.',
  cart: 'Cart', cart_empty: 'Your cart is empty.', subtotal: 'Subtotal', checkout: 'Checkout', checkout_note: 'Taxes and delivery at checkout.', remove: 'Remove',
  cod_h: 'Open before you pay', cod_s: 'Cash on delivery. Check every cap before you hand over a pound.', gift_up: 'Make it a gift', gift_up_s: 'Navy box, foam set, gift card', to_checkout: 'Continues to the standard Shopify checkout.',
  mh_eyebrow: 'Made Here', mh_h: 'Crafted in our own workshop.', mh_lead: 'Design, build, finish and test, under one roof. Shown, never shouted.',
  m1h: 'Every piece starts in CAD.', m1s: 'Each cap is drawn to the millimetre for its hub. Fit is designed before anything is cut.',
  m2h: 'Built in-house, in small runs.', m2s: 'Small runs keep every set close to the bench, and keep the drop rare.',
  m3h: 'Every edge checked by hand.', m3s: 'Shells are finished, bearings seated and plates set by hand. The detail is the product.',
  m4h: 'Real heat, real roads, real use.', m4s: 'Tested moving, not just standing still.',
  heat_eyebrow: 'The August heat test', heat_h: 'Parked in August. Driven the same day.', heat_s: 'Caps sit on dark wheels under the midday sun, then go straight onto the road. Then we check every one.',
  k1: 'Peak wheel-surface temperature logged', k2: 'Road kilometres per test set', k3: 'Caps lost in testing', film: 'Workshop film', film_s: 'The build, from CAD to the road',
  nx_eyebrow: 'Coming next', nx_h: 'Under the cover.', nx_lead: 'Two new lines are in the workshop. Scroll to bring the light across.',
  nx_form_h: 'Be first when they drop.', nx_form_s: 'Leave your email or WhatsApp. One message when a line opens, nothing else.', email_wa: 'Email or WhatsApp number', which: 'Which line', both: 'Both', notify_ok: 'You’re on the list. We’ll message you once, when it opens.', notify_err: 'Enter an email or a phone number we can reach.',
  sup_eyebrow: 'Warranty, exchange & FAQ', sup_h: 'We stand behind every set.', sup_lead: 'Three promises, in plain words.',
  w1: 'Open before you pay', w1s: 'Cash on delivery with inspection. Open the box, check every cap, then pay.', w2: 'Easy exchange', w2s: 'If it doesn’t fit, we swap it. Send a photo on WhatsApp and we arrange the exchange.', w3: 'If it falls off, we replace it.', w3s: 'That is the warranty. No forms, no fine print games.',
  ct_eyebrow: 'Real people', ct_h: 'Talk to the workshop.',
},
ar: {
  nav_shop: 'المتجر', nav_made: 'اتعمل هنا', nav_next: 'الجاي', nav_support: 'الضمان والأسئلة', menu: 'القائمة', close: 'اقفل',
  hero_eyebrow: 'Drop 01 · أغطية سنتر عائمة', hero_sub: 'العجلة بتلف، واللوجو ثابت مكانه. أغطية سنتر عائمة، متشطبة لأدق تفصيلة، بكمية محدودة.',
  cta_shop: 'اطلب من الـ Drop', cta_fit: 'شوف مقاس عربيتك', scroll: 'انزل', run: 'Run 01 · كمية محدودة',
  st1: 'العجلة بتلف. واللوجو ثابت.', st1s: 'بلي مقفول وثقل موازنة بيخلّوا الوش مستوي على أي سرعة.',
  st2s: 'أربع قطع. كل حرف متشيك عليه بالإيد.', st3: 'متشطب لأدق تفصيلة.', st4s: 'دايمًا سابق بخطوة.',
  p_plate: 'وش اللوجو', p_plate_s: 'الوش بتاع الإصدار', p_shell: 'الجسم', p_shell_s: 'متخرّط ومتشطب بالإيد', p_bearing: 'بلي مقفول', p_bearing_s: 'بيخلي الوش يلف براحته', p_weight: 'ثقل الموازنة', p_weight_s: 'بيخلي اللوجو معدول',
  ed_eyebrow: 'تلات إصدارات', ed_h: 'اختار الوش اللي هيمشي معاك.', ed_lead: 'نفس الصنعة العائمة، بتلات وشوش. عدّي على غطا أو دوس عليه عشان يقرّب.',
  street: 'Street', signature: 'Signature', custom: 'Custom',
  street_s: 'شعار عربيتك نفسه، ثابت وهو بيلف.', ed_k1: 'متاح', ed_k2: 'متاح', ed_k3: 'بالطلب', signature_s: 'رمز OUTRUN. خطين سرعة.', custom_s: 'تصميمك إنت، متقصوص ومتشطب لجنوطك.',
  shop_ed: 'اطلب {e}', fit_eyebrow: 'مقاس عربيتك', fit_h: 'معمول بالمللي على عربيتك.', fit_lead: 'مرسيدس وBMW وMG في البداية. أي عربية تانية بنعملها في حوالي يوم.',
  make: 'الماركة', model: 'الموديل', other: 'تانية', pick_make: 'اختار الماركة', pick_model: 'اختار الموديل',
  fit_ready: 'مظبوط على {m}', fit_ready_s: 'طقم ٤ قطع، مقاسه مظبوط على {m}. بيتركب في السنتر الأصلي على طول.', fit_shop: 'اطلب لعربيتي {m}',
  fit_wait: 'عربيتك، ومقاسها.', fit_wait_s: 'اختار الماركة والموديل عشان تشوف الطقم بتاعك.',
  other_h: 'عربيتك مش موجودة؟', other_s: 'بنعملها في حوالي يوم. ابعتلنا العربية والجنط على واتساب.', other_ph: 'مثلًا: أودي A4 2020', wa_cta: 'اطلب على واتساب',
  reels_eyebrow: 'على عربيات حقيقية', reels_h: 'Performance looks better here.', reels_lead: 'فيديوهات من عملائنا على عربياتهم. عدّي أو دوس عشان تشتغل.', reel_slot: 'فيديو عميل', tap: 'دوس للتشغيل',
  craft_eyebrow: 'الصنعة', craft_h: 'متعمل في ورشتنا.', craft_lead: 'بنوريه، مش بنزعّق بيه.', craft_more: 'جوه الورشة',
  c1: 'تصميم', c1s: 'كل قطعة بتبدأ على الـ CAD.', c2: 'تصنيع', c2s: 'جوه الورشة، وبكميات صغيرة.', c3: 'تشطيب', c3s: 'كل حرف متشيك عليه بالإيد.', c4: 'اختبار', c4s: 'حر حقيقي، وطرق حقيقية، واستخدام حقيقي.',
  tr1: 'افتح قبل ما تدفع', tr1s: 'الدفع عند الاستلام. شوف الطقم الأول.', tr2: 'استبدال سهل', tr2s: 'لو مش مظبوط، بنبدّله.', tr3: 'ضمان واضح', tr3s: 'لو وقع، بنجيبلك غيره.', tr4: 'ناس حقيقية', tr4s: 'تليفون، واتساب، وورشة حقيقية.',
  next_eyebrow: 'اسم واحد. تلات خطوط.', next_h: 'Car نزل. Ride وKart جايين.', next_lead: 'الخطوط بتفتح بالترتيب، عمرها ما بتفتح مرة واحدة.',
  ride: 'Ride', ride_s: 'سكوترات وسكيت بورد كهربا وهوفربورد.', kart: 'Kart', kart_s: 'كارتينج كهربا للفسحة.', phase2: 'المرحلة التانية', phase3: 'المرحلة التالتة', notify: 'بلّغني',
  gift_eyebrow: 'علبة الهدية', gift_h: 'طقم من ٤، في علبة كأنها launch.', gift_s: 'الأغطية متسابة في فوم جوه علبة نيفي بتتفتح على مهلها. للفالنتاين وأعياد الميلاد والعيد.', gift_add: 'ضيف علبة الهدية', occ1: 'الفالنتاين', occ2: 'أعياد الميلاد', occ3: 'العيد',
  foot_shop: 'المتجر', foot_help: 'المساعدة', foot_talk: 'كلمنا', foot_tag: 'قطع حصرية، متشطبة لأدق تفصيلة، بتخلي اللي بيسوقوا ويركبوا سابقين.',
  calm: 'حركة هادية', dev: 'سكشنز شوبيفاي', lang_btn: 'English', wa: 'واتساب', phone: 'تليفون', workshop: 'الورشة', workshop_addr: 'عنوان الورشة · القاهرة (مؤقت)', hours: 'بنرد في خلال ساعة، من ١٠ الصبح لـ ١٠ بالليل', copy: 'انسخ', copied: 'اتنسخ',
  col_eyebrow: 'OUTRUN Car', col_h: 'أغطية سنتر عائمة.', col_lead: 'تلات إصدارات وتلات تشطيبات. كل طقم بيركب على مرسيدس وBMW وMG في البداية.',
  f_make: 'الماركة', f_ed: 'الإصدار', f_fin: 'التشطيب', all: 'الكل', gloss: 'Gloss Black', steel: 'Satin Steel', ice: 'Ice Chrome',
  set4: 'طقم ٤ قطع', made_day: 'بيتعمل في حوالي يوم', in_run: 'موجود في الـ Run', no_match: 'مفيش حاجة مطابقة. شيل فلتر.', clear: 'امسح الفلاتر', drag360: '360°', gift_box: 'علبة الهدية', gift_box_s: 'علبة نيفي، فوم، وكارت إهداء',
  pdp_eyebrow: 'OUTRUN Car · Drop 01', pdp_h: 'Floating Center Caps', pdp_lead: 'العجلة بتلف، واللوجو ثابت. بلي مقفول وثقل موازنة بيخلّوا الوش مستوي على أي سرعة.',
  stock_l: 'فاضل {n} من {t} طقم في Run 01', stock_r: 'كمية محدودة', edition: 'الإصدار', finish: 'التشطيب', fitment: 'المقاس', choose: 'اختار',
  upload_h: 'ارفع تصميمك', upload_s: 'PNG أو SVG بتباين عالي. بنبعتلك بروفة على واتساب قبل ما نقص.', upload_btn: 'اختار ملف', upload_drop: 'أو اسحبه هنا', upload_done: 'بقى على الغطا. لف العارض وشوفه.',
  gift_opt: 'ضيف علبة الهدية', add: 'ضيف للسلة', added: 'اتضاف. الطقم بتاعك في السلة.', need_fit: 'اختار الماركة والموديل الأول، عشان نبعتلك المقاس الصح.',
  spin: 'لف العجلة', drag: 'اسحب عشان تلف', live: 'بيتعدل لوحده، قدامك',
  sp1: 'بيركب على', sp1s: 'مرسيدس · BMW · MG في البداية', sp2: 'الطقم', sp2s: '٤ أغطية + كليبسات', sp3: 'الصنعة', sp3s: 'جسم، بلي مقفول، ثقل موازنة، ووش لوجو', sp4: 'بالطلب', sp4s: 'أي عربية تانية في حوالي يوم',
  faq_eyebrow: 'أسئلة', faq_h: 'إجابات على طول.',
  q1: 'الغطا بيفضل مستوي إزاي؟', a1: 'فيه بلي مقفول بيخلي الوش يلف لوحده بعيد عن الجنط، وثقل موازنة تحت اللوجو بيخليه معدول على أي سرعة.',
  q2: 'هيركب على عربيتي؟', a2: 'مرسيدس وBMW وMG متاحين من البداية. اختار الموديل وإحنا نبعت المقاس المظبوط. عربيتك مش موجودة؟ ابعتهالنا على واتساب ونعملها في حوالي يوم.',
  q3: 'هدفع إزاي؟', a3: 'الدفع عند الاستلام. افتح العلبة، شوف الطقم، وبعدين ادفع للمندوب.',
  q4: 'ولو مش مظبوط؟', a4: 'بنبدّله. ابعتلنا صورة على واتساب وإحنا نرتب الاستبدال.',
  q5: 'ولو غطا وقع؟', a5: 'بنجيبلك غيره. ده الضمان، في سطر واحد.',
  q6: 'ينفع أبعته هدية؟', a6: 'أكيد. ضيف علبة الهدية واكتب رسالة للكارت.',
  q7: 'محتاج ملف إيه للـ Custom؟', a7: 'PNG أو SVG بحواف واضحة. بنبعتلك بروفة على واتساب قبل ما نعمل الطقم.',
  q8: 'التوصيل بياخد قد إيه؟', a8: 'مواعيد التوصيل حسب المدينة بتظهر في الـ checkout. الـ Custom والطلبات الخاصة بتزود حوالي يوم.',
  cart: 'السلة', cart_empty: 'السلة فاضية.', subtotal: 'الإجمالي', checkout: 'كمّل الطلب', checkout_note: 'الضرايب والتوصيل في الـ checkout.', remove: 'شيل',
  cod_h: 'افتح قبل ما تدفع', cod_s: 'الدفع عند الاستلام. شيّك على كل غطا قبل ما تدفع جنيه.', gift_up: 'خليها هدية', gift_up_s: 'علبة نيفي، فوم، وكارت إهداء', to_checkout: 'بيكمّل على الـ checkout العادي بتاع شوبيفاي.',
  mh_eyebrow: 'اتعمل هنا', mh_h: 'متعمل في ورشتنا.', mh_lead: 'تصميم وتصنيع وتشطيب واختبار، تحت سقف واحد. بنوريه، مش بنزعّق بيه.',
  m1h: 'كل قطعة بتبدأ على الـ CAD.', m1s: 'كل غطا بيترسم بالمللي على مقاس السنتر بتاعه. المقاس بيتصمم قبل ما أي حاجة تتقص.',
  m2h: 'بنصنعه جوه، وبكميات صغيرة.', m2s: 'الكميات الصغيرة بتخلي كل طقم قريب من الترابيزة، وبتخلي الـ drop نادر.',
  m3h: 'كل حرف متشيك عليه بالإيد.', m3s: 'الجسم بيتشطب، والبلي بيتركب، والوش بيتثبت بالإيد. التفصيلة هي المنتج.',
  m4h: 'حر حقيقي، وطرق حقيقية.', m4s: 'بنختبره وهو ماشي، مش وهو واقف بس.',
  heat_eyebrow: 'اختبار حر أغسطس', heat_h: 'راكن في أغسطس. وماشي في نفس اليوم.', heat_s: 'الأغطية بتقعد على جنوط غامقة تحت شمس الضهر، وبعدها على الطريق على طول. وبعدين بنشيّك على كل واحد.',
  k1: 'أعلى حرارة اتسجلت على سطح الجنط', k2: 'كيلومتر طريق لكل طقم اختبار', k3: 'غطا وقع في الاختبار', film: 'فيلم الورشة', film_s: 'الصنعة، من الـ CAD للطريق',
  nx_eyebrow: 'الجاي', nx_h: 'تحت الغطا.', nx_lead: 'خطين جداد في الورشة. انزل عشان النور يعدّي عليهم.',
  nx_form_h: 'خليك أول واحد يعرف.', nx_form_s: 'سيب إيميلك أو رقم الواتساب. رسالة واحدة لما الخط يفتح، ومفيش غيرها.', email_wa: 'إيميل أو رقم واتساب', which: 'أنهي خط', both: 'الاتنين', notify_ok: 'إنت على القائمة. هنبعتلك مرة واحدة لما يفتح.', notify_err: 'اكتب إيميل أو رقم نقدر نوصلك عليه.',
  sup_eyebrow: 'الضمان والاستبدال والأسئلة', sup_h: 'إحنا ورا كل طقم.', sup_lead: 'تلات وعود، بكلام واضح.',
  w1: 'افتح قبل ما تدفع', w1s: 'الدفع عند الاستلام مع المعاينة. افتح العلبة، شيّك على كل غطا، وبعدين ادفع.', w2: 'استبدال سهل', w2s: 'لو مش مظبوط، بنبدّله. ابعت صورة على واتساب وإحنا نرتب الاستبدال.', w3: 'لو وقع، بنجيبلك غيره.', w3s: 'ده الضمان. من غير ورق ولا شروط مستخبية.',
  ct_eyebrow: 'ناس حقيقية', ct_h: 'كلّم الورشة.',
}};
const t = (k, v = {}) => (T[state.lang][k] ?? T.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const egp = n => `<span class="num latin" data-ph>EGP ${n.toLocaleString('en-US')}</span>`;
const capName = (ed, fin) => `${t(ed)} · ${t(fin)}`;

/* ================= icons ================= */
const LOGO = `<svg viewBox="0 0 1730 258" aria-label="OUTRUN" role="img"><path fill-rule="evenodd" d="M1504 53 1505 256 1555 256 1555 107 1557 105 1663 105 1678 120 1679 256 1729 256 1729 103 1678 52 1556 52 1539 69 1537 68 1537 52ZM1261 52 1261 205 1312 256 1435 256 1486 205 1486 52 1435 52 1435 204 1433 206 1314 206 1312 204 1312 52ZM1243 52 1134 52 1079 107 1080 257 1130 257 1130 121 1147 105 1242 106ZM662 52 662 205 713 256 836 256 887 205 886 52 836 52 835 206 714 206 713 53ZM455 52 404 106 404 205 455 256 591 256 642 206 642 105 590 52ZM455 120 471 104 576 104 591 119 591 189 575 205 471 205 455 189ZM384 52 302 52 165 189 165 256 233 256 384 105ZM220 52 138 52 1 189 0 256 68 257 220 105ZM959 1 958 52 907 52 907 105 958 105 959 205 1010 256 1061 256 1061 206 1010 205 1010 106 1061 105 1061 53 1010 51 1009 0Z"/></svg>`;
const SYM = `<svg viewBox="0 0 385 206" width="22" height="12" fill="currentColor" aria-hidden="true"><path d="M384 0 302 0 165 137 165 204 233 204 384 53ZM220 0 138 0 1 137 0 204 68 205 220 53Z"/></svg>`;
const ARR = `<svg class="arr" viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 5h20M16 1l4 4-4 4"/></svg>`;
const WHEEL = `<svg class="wheel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10.5"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 5v5M12 14v5M5 12h5M14 12h5M7.1 7.1l3.5 3.5M13.4 13.4l3.5 3.5M16.9 7.1l-3.5 3.5M10.6 13.4l-3.5 3.5"/></svg>`;
const I = {
  box: '<svg viewBox="0 0 26 26"><path d="M3 8l10-5 10 5v10l-10 5-10-5z"/><path d="M3 8l10 5 10-5M13 13v10M8 5.5l10 5"/></svg>',
  swap: '<svg viewBox="0 0 26 26"><path d="M4 9h17l-4-4M22 17H5l4 4"/></svg>',
  shield: '<svg viewBox="0 0 26 26"><path d="M13 3l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 13l3 3 5-6"/></svg>',
  chat: '<svg viewBox="0 0 26 26"><path d="M4 12a9 8 0 1 1 4 6.6L4 21l1.2-4A8 8 0 0 1 4 12z"/><path d="M9 11h8M9 14h5"/></svg>',
  play: '<svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><path d="M3 2l7 4-7 4z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 8h18M3 16h12"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/></svg>',
};
const trustBar = () => `<div class="trust">${[['box', 'tr1'], ['swap', 'tr2'], ['shield', 'tr3'], ['chat', 'tr4']].map(([i, k]) => `<div>${I[i]}<p><b>${t(k)}</b><span>${t(k + 's')}</span></p></div>`).join('')}</div>`;
const waLink = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const cvWrap = (fallback, cls = '') => `<div class="cv-wrap ${cls}"><img class="fallback" src="${fallback}" alt="" fetchpriority="high" decoding="async"><canvas class="cv"></canvas></div>`;

/* ================= pages ================= */
const ROUTES = { home: 'home', shop: 'shop', 'floating-caps': 'pdp', 'made-here': 'made', 'coming-next': 'next', support: 'support' };
const NAV = [['shop', 'nav_shop'], ['made-here', 'nav_made'], ['coming-next', 'nav_next'], ['support', 'nav_support']];

const pages = {
home: () => `
<section class="story dark black" id="story" data-section="or-hero-story" data-stage="0">
  <div class="stage">
    <div class="glow-word reveal bgword latin" aria-hidden="true">FEELING</div>
    ${cvWrap('img/wheelspin.jpg')}
    <i class="streak hero-streak" aria-hidden="true"></i>
    <div class="drop-tag"><span class="label latin">Drop 01</span><span class="label">${t('run')}</span></div>
    <div class="hero-copy"><div class="wrap">
      <span class="eyebrow"><span>${t('hero_eyebrow')}</span></span>
      <h1 class="hero-h latin"><span class="w"><span>Drive</span></span><span class="w"><span>the</span></span><span class="w"><span class="glowing">feeling.</span></span></h1>
      <div class="hero-meta"><p class="hero-sub">${t('hero_sub')}</p></div>
      <div class="hero-ctas"><a class="btn solid mag" href="#floating-caps">${t('cta_shop')} ${ARR}</a><button class="btn mag" data-goto="fit">${t('cta_fit')}</button></div>
    </div></div>
    <div class="scroll-cue"><span class="label">${t('scroll')}</span><i></i></div>
    <div class="story-steps" aria-hidden="true">${'<i></i>'.repeat(5)}</div>
    <div class="story-line top" data-st="1"><h2>${t('st1')}</h2><p>${t('st1s')}</p></div>
    <div class="story-line top" data-st="2"><h2 class="latin glowing">Details move differently.</h2><p>${t('st2s')}</p></div>
    <div class="story-line top" data-st="3"><h2>${t('st3')}</h2></div>
    <div class="story-line bot" data-st="4"><h2 class="latin">Built for a different road.</h2><p>${t('st4s')}</p></div>
    ${[['plate', 'l'], ['shell', ''], ['bearing', ''], ['weight', '']].map(([k, c]) => `<div class="plabel ${c}" data-part="${k}"><i class="dot"></i><i class="ln"></i><div class="tx"><b>${t('p_' + k)}</b><span>${t('p_' + k + '_s')}</span></div></div>`).join('')}
  </div>
</section>

<section class="sec editions dark black" data-section="or-editions">
  <div class="wrap sec-head rv"><div><span class="eyebrow">${t('ed_eyebrow')}</span><h2>${t('ed_h')}</h2></div><p class="lead">${t('ed_lead')}</p></div>
  <div class="ed-stage" id="edStage">${cvWrap('img/boxcaps.jpg')}</div>
  <div class="wrap"><div class="ed-tabs" role="tablist">${EDS.map((e, i) => `<button class="ed-tab" role="tab" data-ed="${i}" aria-selected="${i === 1}"><span class="k">${t('edition')} · ${t(e === 'street' ? 'ed_k1' : e === 'signature' ? 'ed_k2' : 'ed_k3')}</span><h3 class="latin">${t(e)}</h3><p>${t(e + '_s')}</p></button>`).join('')}</div>
  <div style="display:flex;justify-content:flex-end;margin-top:24px"><a class="link" id="edShop" href="#floating-caps">${t('shop_ed', { e: t('signature') })}</a></div></div>
</section>

<section class="sec pattern-air" id="fit" data-section="or-fitment">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">${t('fit_eyebrow')}</span><h2>${t('fit_h')}</h2></div><p class="lead">${t('fit_lead')}</p></div>
    <div class="fit-grid">
      <div><div class="fit-steps"><span>01 · ${t('make')}</span></div>
        <div class="makes" style="margin-top:12px">${[...MAKES, 'other'].map(m => `<button class="make" data-make="${m}" aria-pressed="${state.make === m}"><span>${m === 'other' ? t('other') : t('make')}</span><b class="latin">${MAKE_NAME[m] || '+'}</b></button>`).join('')}</div>
        <div class="fit-steps" style="margin-top:28px"><span>02 · ${t('model')}</span></div>
        <div class="models" id="models"></div>
      </div>
      <div class="fit-card dark" id="fitCard"></div>
    </div>
  </div>
</section>

${reelsSection()}

<section class="sec" data-section="or-craft-strip">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">${t('craft_eyebrow')}</span><h2>${t('craft_h')}</h2></div><a class="link" href="#made-here">${t('craft_more')}</a></div>
    <div class="craft">${[['workshop', 'c1'], ['caliper', 'c2'], ['boxcaps', 'c3'], ['carrear', 'c4']].map(([img, k], i) => `<article class="rv"><figure><img src="img/${img}.jpg" alt="" loading="lazy"></figure><div class="body"><span class="n">0${i + 1}</span><h3>${t(k)}</h3><p>${t(k + 's')}</p></div></article>`).join('')}</div>
  </div>
</section>

<section data-section="or-trust-bar"><div class="wrap">${trustBar()}</div></section>

<section class="sec dark" data-section="or-ride-kart-teaser">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">${t('next_eyebrow')}</span><h2>${t('next_h')}</h2></div><p class="lead">${t('next_lead')}</p></div>
    <div class="next-grid">${veil('ride', 'phase2')}${veil('kart', 'phase3')}</div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-section="or-gift-box">
  <div class="wrap"><div class="gift rv dark">
    <figure><img src="img/boxcaps.jpg" alt="Four floating caps set in foam inside the OUTRUN gift box" loading="lazy"></figure>
    <div class="body"><span class="eyebrow">${t('gift_eyebrow')}</span><h2>${t('gift_h')}</h2><p class="lead">${t('gift_s')}</p>
      <div class="occasions">${['occ1', 'occ2', 'occ3'].map(o => `<span class="chip">${t(o)}</span>`).join('')}</div>
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><button class="btn solid mag" data-add-gift>${t('gift_add')} · ${egp(PRICE.gift)}</button></div>
    </div>
  </div></div>
</section>`,

shop: () => `
<section class="phead dark night" data-section="or-collection-header">
  <div class="glow-word reveal bgw latin" aria-hidden="true">CAR</div>
  <div class="wrap"><span class="eyebrow">${t('col_eyebrow')}</span><h1>${t('col_h')}</h1><p class="lead">${t('col_lead')}</p></div>
</section>
<section data-section="or-collection-grid" style="padding-bottom:96px">
  <div class="filters"><div class="wrap" style="display:flex;flex-wrap:wrap;gap:16px 40px;width:100%">
    ${fgroup('make', 'f_make', ['all', ...MAKES, 'other'])}${fgroup('edition', 'f_ed', ['all', ...EDS])}${fgroup('finish', 'f_fin', ['all', ...FINS])}
  </div></div>
  <div class="wrap"><div class="grid" id="grid"></div></div>
</section>
<section data-section="or-trust-bar" style="padding-bottom:64px"><div class="wrap">${trustBar()}</div></section>`,

pdp: () => `
<section class="pdp" data-section="or-product-main">
  <div class="viewer dark">${cvWrap('img/caliper.jpg')}
    <div class="vtop"><span class="label">${t('drag')}</span><span class="label latin">360°</span></div>
    <div class="vbar"><button class="spin-toggle" id="spinT" aria-pressed="false">${WHEEL}<span>${t('spin')}</span></button><span class="label" id="liveL" hidden>${t('live')}</span></div>
  </div>
  <div class="buy">
    <div style="display:flex;flex-direction:column;gap:14px"><span class="eyebrow latin">OUTRUN Car · Drop 01</span><h1 class="latin">Floating Center Caps</h1><p class="lead" style="font-size:16px">${t('pdp_lead')}</p></div>
    <div class="price-row"><span class="p" id="pPrice"></span><span class="label">${t('set4')}</span></div>
    <div class="stock" data-ph><div class="row"><span>${t('stock_l', { n: `<b class="num">${STOCK.left}</b>`, t: STOCK.run })}</span><span>${t('stock_r')}</span></div><div class="track"><i style="width:${STOCK.left / STOCK.run * 100}%"></i></div></div>
    <div class="opt"><div class="opt-h"><span class="label">${t('edition')}</span></div>
      <div class="seg" id="edSeg">${EDS.map(e => `<button data-ed="${e}" aria-pressed="${state.edition === e}"><b class="latin">${t(e)}</b><span>${t(e + '_s')}</span></button>`).join('')}</div></div>
    <div id="uploadBox"></div>
    <div class="opt"><div class="opt-h"><span class="label">${t('finish')}</span><span class="label" id="finName"></span></div>
      <div class="swatches" id="finSw">${FINS.map(f => `<button class="sw" data-fin="${f}" aria-pressed="${state.finish === f}"><i style="background:${FIN_SW[f]}"></i><span class="latin">${t(f)}</span></button>`).join('')}</div></div>
    <div class="opt" id="fitOpt"><div class="opt-h"><span class="label">${t('fitment')}</span></div>
      <div class="two">
        <div class="field"><label for="selMake">${t('make')}</label><select class="select" id="selMake"><option value="">${t('choose')}</option>${MAKES.map(m => `<option value="${m}">${MAKE_NAME[m]}</option>`).join('')}<option value="other">${t('other')}</option></select></div>
        <div class="field"><label for="selModel">${t('model')}</label><select class="select" id="selModel"></select></div>
      </div>
      <div class="note">${I.chat.replace('<svg', '<svg width="20" height="20" style="flex:none;stroke:var(--blue);fill:none;stroke-width:1.3"')}<p><b style="color:var(--fg);font-weight:500">${t('other_h')}</b> ${t('other_s')} <a href="${waLink('Hi OUTRUN, I want floating caps for my car: ')}" target="_blank" rel="noopener">${t('wa_cta')}</a></p></div>
    </div>
    <button class="check" id="giftChk" aria-pressed="${state.gift}"><span class="bx"></span><img src="img/box.jpg" alt=""><span class="t"><b>${t('gift_opt')}</b><span>${t('gift_box_s')}</span></span>${egp(PRICE.gift)}</button>
    <div class="atc"><button class="btn solid mag" id="atc">${t('add')} ${ARR}</button></div>
    <div class="mini-trust">${[['box', 'tr1'], ['swap', 'tr2'], ['shield', 'tr3'], ['chat', 'tr4']].map(([i, k]) => `<div>${I[i]}<p><b>${t(k)}</b>${t(k + 's')}</p></div>`).join('')}</div>
  </div>
</section>
<section class="sec" style="padding-bottom:0" data-section="or-product-specs"><div class="wrap"><div class="specs">${['sp1', 'sp2', 'sp3', 'sp4'].map(k => `<div><span class="label">${t(k)}</span><b>${t(k + 's')}</b></div>`).join('')}</div></div></section>
${reelsSection()}
${faqSection(true)}`,

made: () => `
<section class="mh-hero dark black" data-section="or-made-hero">
  <img src="img/workshop.jpg" alt="CAD drawings of the cap on screen beside a 3D printer in the OUTRUN workshop">
  <div class="glow-word reveal bgw latin" aria-hidden="true">WORKSHOP</div>
  <div class="wrap"><span class="eyebrow">${t('mh_eyebrow')}</span><h1>${t('mh_h')}</h1><p class="lead">${t('mh_lead')}</p></div>
</section>
<section data-section="or-craft-steps"><div class="wrap">
  ${[['workshop', 'm1'], ['wheelspin', 'm2'], ['caliper', 'm3'], ['carrear2', 'm4']].map(([img, k], i) => `<div class="step rv"><figure><img src="img/${img}.jpg" alt="" loading="lazy"></figure><div class="tx"><span class="n">0${i + 1}</span><span class="eyebrow">${t('c' + (i + 1))}</span><h2>${t(k + 'h')}</h2><p class="lead">${t(k + 's')}</p></div></div>`).join('')}
</div></section>
<section class="sec heat dark night" data-section="or-heat-test"><div class="wrap">
  <div class="sec-head" style="margin:0"><div><span class="eyebrow">${t('heat_eyebrow')}</span><h2>${t('heat_h')}</h2></div><p class="lead">${t('heat_s')}</p></div>
  <div class="counters" data-ph>
    <div><b><span data-count="68">0</span><small>°C</small></b><span>${t('k1')}</span></div>
    <div><b><span data-count="1000">0</span><small>km</small></b><span>${t('k2')}</span></div>
    <div><b><span data-count="0">0</span></b><span>${t('k3')}</span></div>
  </div>
</div></section>
<section class="sec" data-section="or-video-feature"><div class="wrap">
  <button class="film reel-like" data-film><img src="img/carrear.jpg" alt="" loading="lazy"><span class="ov"><span style="display:flex;flex-direction:column;gap:6px;text-align:start"><span class="label">${t('film')}</span><b style="font-family:var(--f-display);font-size:22px">${t('film_s')}</b></span><span class="play" style="width:52px;height:52px;border-radius:50%;border:1px solid var(--hair-2);display:grid;place-items:center">${I.play}</span></span></button>
</div></section>
<section data-section="or-trust-bar" style="padding-bottom:96px"><div class="wrap">${trustBar()}</div></section>`,

next: () => `
<section class="phead dark night" data-section="or-next-header">
  <div class="glow-word reveal bgw latin" aria-hidden="true">NEXT</div>
  <div class="wrap"><span class="eyebrow">${t('nx_eyebrow')}</span><h1>${t('nx_h')}</h1><p class="lead">${t('nx_lead')}</p></div>
</section>
<section class="sec dark" data-section="or-silhouette-reveal"><div class="wrap" style="display:flex;flex-direction:column;gap:12px">${veil('ride', 'phase2', 'tall')}${veil('kart', 'phase3', 'tall')}</div></section>
<section class="sec" style="padding-top:0" data-section="or-notify-signup"><div class="wrap notify">
  <div style="display:flex;flex-direction:column;gap:18px"><span class="eyebrow">${t('notify')}</span><h2 style="font-size:var(--t-h2)">${t('nx_form_h')}</h2><p class="lead">${t('nx_form_s')}</p></div>
  <form class="form" id="notifyForm" novalidate>
    <div class="field"><label for="nfContact">${t('email_wa')}</label><input class="input" id="nfContact" autocomplete="email" placeholder="name@mail.com · +20 1…"></div>
    <div class="field"><label>${t('which')}</label><div class="row" style="display:flex;gap:8px;flex-wrap:wrap">${['both', 'ride', 'kart'].map((k, i) => `<button type="button" class="chip" data-line="${k}" aria-pressed="${i === 0}">${t(k)}</button>`).join('')}</div></div>
    <button class="btn solid mag" type="submit">${t('notify')} ${ARR}</button>
    <div id="nfMsg"></div>
  </form>
</div></section>`,

support: () => `
<section class="phead dark night" data-section="or-support-header">
  <div class="glow-word reveal bgw latin" aria-hidden="true">AHEAD</div>
  <div class="wrap"><span class="eyebrow">${t('sup_eyebrow')}</span><h1>${t('sup_h')}</h1><p class="lead">${t('sup_lead')}</p></div>
</section>
<section class="sec pattern-air" data-section="or-policy-cards"><div class="wrap"><div class="policy">
  ${[['box', 'w1'], ['swap', 'w2'], ['shield', 'w3']].map(([i, k]) => `<article class="rv">${I[i]}<h3>${t(k)}</h3><p>${t(k + 's')}</p></article>`).join('')}
</div></div></section>
<section class="sec" data-section="or-contact"><div class="wrap">
  <div class="sec-head"><div><span class="eyebrow">${t('ct_eyebrow')}</span><h2>${t('ct_h')}</h2></div><p class="lead">${t('hours')}</p></div>
  <div class="contact">
    <div><span class="label">${t('wa')}</span><b class="latin" data-ph>${PHONE}</b><div class="copy-row"><a class="link" href="${waLink('Hi OUTRUN')}" target="_blank" rel="noopener">${t('wa_cta')}</a></div></div>
    <div><span class="label">${t('phone')}</span><b class="latin" data-ph>${PHONE}</b><div class="copy-row"><button class="copy" data-copy="${PHONE}">${t('copy')}</button></div></div>
    <div><span class="label">${t('workshop')}</span><b data-ph>${t('workshop_addr')}</b></div>
    <div><span class="label">Email</span><b class="latin" data-ph>hello@outrun.example</b><div class="copy-row"><button class="copy" data-copy="hello@outrun.example">${t('copy')}</button></div></div>
  </div>
</div></section>
${faqSection()}`,
};

function reelsSection() {
  const clips = [['drop', 'BMW 3 Series'], ['caliper', 'Mercedes C-Class'], ['carrear2', 'BMW X5'], ['wheelspin', 'Mercedes E-Class']];
  return `<section class="sec" data-section="or-customer-videos"><div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">${t('reels_eyebrow')}</span><h2 class="latin">Performance looks better here.</h2></div><p class="lead">${t('reels_lead')}</p></div>
    <div class="reels">${clips.map(([img, car], i) => `<button class="reel" data-reel aria-label="${t('reel_slot')} ${i + 1}: ${car}"><img src="img/${img}.jpg" alt="" loading="lazy"><span class="tag label" data-ph>${t('reel_slot')} 0${i + 1}</span><span class="play">${I.play}</span><span class="meta"><b class="latin">${car}</b><span class="label">${i % 2 ? t('signature') : t('street')} · ${t('tap')}</span><span class="bar"><i></i></span></span></button>`).join('')}</div>
  </div></section>`;
}
function faqSection(light) {
  return `<section class="sec${light ? ' pattern-air' : ''}" data-section="or-faq"><div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:40px">
    <div style="display:flex;flex-direction:column;gap:18px"><span class="eyebrow">${t('faq_eyebrow')}</span><h2 style="font-size:var(--t-h2)">${t('faq_h')}</h2></div>
    <div class="faq">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<details${n === 1 ? ' open' : ''}><summary>${t('q' + n)}<i></i></summary><p>${t('a' + n)}</p></details>`).join('')}</div>
  </div></section>`;
}
function veil(k, phase, cls = '') {
  return `<article class="veil ${cls}" data-veil><img class="dark" src="img/${k}.jpg" alt=""><img class="lit" src="img/${k}.jpg" alt="Silhouette of the upcoming OUTRUN ${k === 'ride' ? 'Ride e-scooter' : 'Kart electric kart'}"><span class="cover"></span>
    <div class="meta"><div style="display:flex;flex-direction:column;gap:8px"><span class="phase">${t(phase)}</span><h3 class="latin">OUTRUN ${t(k)}</h3><span class="label" style="text-transform:none;letter-spacing:.02em;font-family:var(--f-body);font-size:14px">${t(k + '_s')}</span></div>
    <a class="btn sm" href="#coming-next">${t('notify')}</a></div></article>`;
}
function fgroup(key, label, opts) {
  return `<div class="fgroup"><span class="label">${t(label)}</span><div class="row">${opts.map(o => `<button class="chip" data-f="${key}" data-v="${o}" aria-pressed="${state.filters[key] === o}">${o === 'all' ? t('all') : MAKE_NAME[o] || (o === 'other' ? t('other') : t(o))}</button>`).join('')}</div></div>`;
}

/* ================= shell ================= */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'); let route = 'home'; let disposers = [];
document.documentElement.classList.add('js');

function renderHeader() {
  $('#hdr').innerHTML = `<div class="wrap">
    <a class="logo" href="#home" aria-label="OUTRUN home">${LOGO}</a>
    <nav class="nav">${NAV.map(([h, k]) => `<a href="#${h}" ${ROUTES[h] === route ? 'aria-current="page"' : ''}>${t(k)}</a>`).join('')}</nav>
    <div class="hdr-r">
      <button class="icon-btn lang" id="langBtn" aria-label="Switch language"><b>${state.lang === 'en' ? 'EN' : 'AR'}</b>&nbsp;<span>/ ${state.lang === 'en' ? 'AR' : 'EN'}</span></button>
      <button class="icon-btn cart-btn" id="cartBtn" aria-label="${t('cart')}">${WHEEL}<span class="count num">${cartCount()}</span></button>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="${t('menu')}">${I.menu}</button>
    </div></div>`;
  $('#mnav').innerHTML = `<div class="top"><a class="logo" href="#home">${LOGO}</a><button class="icon-btn" id="menuX" aria-label="${t('close')}">${I.x}</button></div>
    <nav>${[['home', 'OUTRUN'], ...NAV].map(([h, k]) => `<a href="#${h}">${h === 'home' ? '<span class="latin">Drive the feeling.</span>' : t(k)}</a>`).join('')}</nav>
    <div class="foot"><span class="label">${t('wa')}</span><span class="latin">${PHONE}</span><button class="btn sm" id="langBtn2" style="align-self:flex-start">${t('lang_btn')}</button></div>`;
}
function renderFooter() {
  $('#foot').innerHTML = `<div class="foot dark" data-section="or-footer"><div class="wrap">
    <div class="big" aria-hidden="true">${LOGO.replace('aria-label="OUTRUN" role="img"', '')}</div>
    <div class="foot-grid">
      <div style="display:flex;flex-direction:column;gap:16px"><span class="latin" style="font-family:var(--f-display);font-size:22px;font-weight:600">Drive the feeling.</span><p style="color:var(--muted);max-width:36ch">${t('foot_tag')}</p></div>
      <div><h4>${t('foot_shop')}</h4><ul><li><a href="#floating-caps">Floating Center Caps</a></li><li><a href="#shop">OUTRUN Car</a></li><li><a href="#coming-next">OUTRUN Ride · Kart</a></li><li><a href="#made-here">${t('nav_made')}</a></li></ul></div>
      <div><h4>${t('foot_help')}</h4><ul><li><a href="#support">${t('nav_support')}</a></li><li><button data-goto-support>${t('tr2')}</button></li><li><button data-goto-support>${t('tr3')}</button></li></ul></div>
      <div><h4>${t('foot_talk')}</h4><ul><li data-ph>${t('wa')} · <span class="latin">${PHONE}</span></li><li data-ph>${t('workshop_addr')}</li><li style="color:var(--muted)">${t('hours')}</li></ul></div>
    </div>
    <div class="base"><span class="latin">© 2026 OUTRUN · Always ahead. Always noticed.</span>
      <span style="display:flex;gap:20px;flex-wrap:wrap"><button class="toggle" id="calmT" aria-pressed="${state.calm}"><i></i>${t('calm')}</button><button class="toggle" id="devT" aria-pressed="${state.dev}"><i></i>${t('dev')}</button><button class="link" id="langBtn3">${t('lang_btn')}</button></span></div>
  </div></div>`;
}

function setLang(l) {
  state.lang = l; store.set('lang', l);
  document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  renderHeader(); renderFooter(); render(true); renderCart();
}

function render(keepScroll) {
  disposers.forEach(d => { try { d(); } catch {} }); disposers = [];
  const y = scrollY;
  app.classList.remove('in'); app.innerHTML = pages[route](); void app.offsetWidth; if (!state.calm) app.classList.add('in');
  renderHeader();
  $('#satc').innerHTML = ''; $('#satc').classList.remove('on');
  ({ home: mountHome, shop: mountShop, pdp: mountPDP, made: mountMade, next: mountNext, support: () => {} })[route]();
  mountCommon();
  if (keepScroll) { lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); } else { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); }
  if (state.dev) renderDev();
}
function go() {
  const h = location.hash.slice(1); const r = ROUTES[h] || 'home';
  if (r === route && app.innerHTML) return;
  route = r; render(); sweep(); closeMenu();
}

/* ================= common behaviors ================= */
let lenis = null;
function startLenis() {
  if (lenis || state.calm || !window.Lenis) return;
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  const raf = time => { lenis?.raf(time); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
function stopLenis() { lenis?.destroy(); lenis = null; }

let lastSweep = 0;
function sweep() { if (state.calm) return; const now = performance.now(); if (now - lastSweep < 1100) return; lastSweep = now; const s = $('#sweep'); s.classList.remove('go'); void s.offsetWidth; s.classList.add('go'); }

function mountCommon() {
  // section headlight sweeps
  const seen = new WeakSet(); let first = true;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !seen.has(e.target)) { seen.add(e.target); if (!first) sweep(); } }), { threshold: .22 });
  $$('[data-section]', app).forEach((s, i) => { if (i === 0) seen.add(s); else io.observe(s); }); setTimeout(() => first = false, 600);
  disposers.push(() => io.disconnect());
  // reveals (only for content below the fold, so the first frame is complete)
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv, .step', app).forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .95 && !state.calm) el.classList.add('pre'); rio.observe(el); });
  disposers.push(() => rio.disconnect());
  // count-up
  const cio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; cio.unobserve(e.target); const el = e.target, to = +el.dataset.count; if (state.calm || !to) { el.textContent = to.toLocaleString('en-US'); return; } const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US'); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }), { threshold: .5 });
  $$('[data-count]', app).forEach(el => cio.observe(el)); disposers.push(() => cio.disconnect());
  // magnetic buttons
  if (!state.calm && matchMedia('(hover: hover)').matches) $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; b.style.transform = ''; setTimeout(() => b.style.transition = '', 500); });
  });
  // reels: hover on desktop, tap on touch
  $$('[data-reel],[data-film]', app).forEach(r => {
    r.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !state.calm) r.classList.add('playing'); });
    r.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') r.classList.remove('playing'); });
    r.addEventListener('click', () => { const on = !r.classList.contains('playing'); $$('.playing', app).forEach(x => x.classList.remove('playing')); r.classList.toggle('playing', on); });
  });
  // light sweep reveal on silhouettes, bound to scroll
  const veils = $$('[data-veil]', app);
  if (veils.length) {
    const upd = () => veils.forEach(v => { if (state.calm) { v.style.setProperty('--rev', 1); return; } const r = v.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .9 + r.height * .5))); v.style.setProperty('--rev', p.toFixed(3)); });
    addEventListener('scroll', upd, { passive: true }); upd(); disposers.push(() => removeEventListener('scroll', upd));
  }
  // copy buttons
  $$('[data-copy]', app).forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = t('copied'); } catch { const s = getSelection(); const r = document.createRange(); r.selectNodeContents(b.parentElement.previousElementSibling); s.removeAllRanges(); s.addRange(r); } }));
  $$('[data-add-gift]', app).forEach(b => b.addEventListener('click', () => addGift()));
  $$('[data-goto]', app).forEach(b => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.goto); lenis ? lenis.scrollTo(el, { offset: -64 }) : el.scrollIntoView({ behavior: state.calm ? 'auto' : 'smooth' }); }));
}

/* 3D: lazy-load Three.js only when a 3D section is about to be seen */
let scenesP = null;
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
function lazy3D(wrap, mount) {
  if (!webgl) { wrap.querySelector('.fallback').style.opacity = 1; return; }
  let api = null, dead = false;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    try { scenesP ??= import('./three-scenes.js'); const S = await scenesP; if (dead) return; api = mount(S, wrap.querySelector('canvas')); wrap.classList.add('ready'); }
    catch (err) { console.warn('3D unavailable, showing fallback', err); wrap.querySelector('.fallback').style.opacity = 1; }
  }, { rootMargin: '300px' });
  io.observe(wrap);
  disposers.push(() => { dead = true; io.disconnect(); api?.dispose?.(); });
  return () => api;
}

/* ================= HOME ================= */
function mountHome() {
  const story = $('#story'); const labels = {}; $$('.plabel', story).forEach(l => labels[l.dataset.part] = l);
  const setStage = st => { story.dataset.stage = st; $$('.story-line', story).forEach(l => l.classList.toggle('on', +l.dataset.st === st)); $$('.story-steps i', story).forEach((d, i) => d.classList.toggle('on', i === st)); };
  setStage(0);
  lazy3D($('.cv-wrap', story), (S, cv) => S.mountHero(cv, story, { labels, calm: state.calm, onStage: setStage }));
  // editions
  const tabs = $$('.ed-tab'); let edApi;
  const setTab = i => { tabs.forEach((b, j) => b.setAttribute('aria-selected', i === j)); $('#edShop').textContent = t('shop_ed', { e: t(EDS[i]) }); $('#edShop').dataset.ed = EDS[i]; };
  const get = lazy3D($('#edStage .cv-wrap'), (S, cv) => S.mountEditions(cv, { calm: state.calm, onActive: setTab }));
  tabs.forEach((b, i) => { const on = () => { setTab(i); get?.()?.setActive(i); }; b.addEventListener('click', on); b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') on(); }); });
  $('#edShop').addEventListener('click', e => { state.edition = e.currentTarget.dataset.ed || 'signature'; });
  // fitment
  const models = $('#models'), card = $('#fitCard');
  const drawFit = () => {
    $$('.make').forEach(b => b.setAttribute('aria-pressed', b.dataset.make === state.make));
    if (state.make === 'other') {
      models.innerHTML = `<input class="input" id="otherCar" placeholder="${t('other_ph')}" style="max-width:360px">`;
      card.innerHTML = `<span class="ok">${t('made_day')}</span><h3>${t('other_h')}</h3><p style="color:var(--muted)">${t('other_s')}</p><a class="btn solid" style="margin-top:auto;align-self:flex-start" id="waOther" href="${waLink('Hi OUTRUN, floating caps for my car: ')}" target="_blank" rel="noopener">${t('wa_cta')} ${ARR}</a><i class="streak"></i>`;
      $('#otherCar').addEventListener('input', e => $('#waOther').href = waLink('Hi OUTRUN, floating caps for my car: ' + e.target.value));
      return;
    }
    models.innerHTML = state.make ? MODELS[state.make].map(m => `<button class="chip latin" data-model="${m}" aria-pressed="${state.model === m}">${m}</button>`).join('') : `<span style="color:var(--muted)">${t('pick_make')}</span>`;
    $$('[data-model]', models).forEach(b => b.addEventListener('click', () => { state.model = b.dataset.model; drawFit(); }));
    const full = state.make && state.model ? `${MAKE_NAME[state.make]} ${state.model}` : '';
    card.innerHTML = full
      ? `<span class="ok">${t('in_run')}</span><h3>${t('fit_ready', { m: `<span class="latin">${full}</span>` })}</h3><p style="color:var(--muted)">${t('fit_ready_s', { m: `<span class="latin">${full}</span>` })}</p><a class="btn solid mag" style="margin-top:auto;align-self:flex-start" href="#floating-caps">${t('fit_shop', { m: `<span class="latin">${full}</span>` })} ${ARR}</a><i class="streak"></i>`
      : `<span class="label">${t('fitment')}</span><h3>${t('fit_wait')}</h3><p style="color:var(--muted)">${t('fit_wait_s')}</p><i class="streak"></i>`;
  };
  $$('.make').forEach(b => b.addEventListener('click', () => { state.make = b.dataset.make; state.model = ''; drawFit(); }));
  drawFit();
}

/* ================= COLLECTION ================= */
const PRODUCTS = [...EDS.flatMap(e => FINS.map(f => ({ id: `cap-${e}-${f}`, edition: e, finish: f, price: PRICE[e] }))), { id: 'gift', gift: true, price: PRICE.gift }];
function mountShop() {
  const grid = $('#grid');
  const draw = () => {
    const F = state.filters;
    const list = PRODUCTS.filter(p => p.gift ? (F.edition === 'all' && F.finish === 'all') : (F.edition === 'all' || p.edition === F.edition) && (F.finish === 'all' || p.finish === F.finish));
    grid.innerHTML = list.length ? list.map(p => p.gift
      ? `<a class="card" href="#home" data-gift-card><div class="shot"><img src="img/box.jpg" alt="OUTRUN gift box"></div><div class="info"><span class="label">${t('gift_eyebrow')}</span><h3>${t('gift_box')}</h3><span class="sub">${t('gift_box_s')}</span><span class="price">${egp(p.price)}</span></div></a>`
      : `<a class="card" href="#floating-caps" data-ed="${p.edition}" data-fin="${p.finish}" data-id="${p.id}"><div class="shot">${state.thumbs?.[p.id] ? `<img src="${state.thumbs[p.id][0]}" alt="">` : '<span class="ph"><i></i></span>'}<span class="badge label">${F.make === 'other' ? t('made_day') : t('in_run')}</span><span class="r360 label latin">360°</span></div>
         <div class="info"><span class="label latin">Floating Center Caps</span><h3 class="latin">${capName(p.edition, p.finish)}</h3><span class="sub">${t(p.edition + '_s')}</span><span class="price">${egp(p.price)} <span class="label">· ${t('set4')}</span></span></div></a>`).join('')
      : `<div class="empty" style="grid-column:1/-1">${t('no_match')}<br><br><button class="btn sm" id="clrF">${t('clear')}</button></div>`;
    $('#clrF')?.addEventListener('click', () => { state.filters = { make: 'all', edition: 'all', finish: 'all' }; $$('[data-f]').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === 'all')); draw(); });
    $$('.card[data-id]', grid).forEach(c => {
      c.addEventListener('click', () => { state.edition = c.dataset.ed; state.finish = c.dataset.fin; if ([...MAKES, 'other'].includes(F.make)) state.make = F.make; });
      let timer, f = 0; const start = () => { const fr = state.thumbs?.[c.dataset.id]; if (!fr || state.calm) return; const img = c.querySelector('.shot img'); clearInterval(timer); timer = setInterval(() => { f = (f + 1) % fr.length; img.src = fr[f]; }, 70); };
      const stop = () => { clearInterval(timer); };
      c.addEventListener('pointerenter', start); c.addEventListener('pointerleave', stop);
      if (matchMedia('(hover: none)').matches) { const io = new IntersectionObserver(([e]) => e.intersectionRatio > .7 ? start() : stop(), { threshold: [0, .7] }); io.observe(c); disposers.push(() => io.disconnect()); }
      disposers.push(stop);
    });
    $$('[data-gift-card]', grid).forEach(c => c.addEventListener('click', e => { e.preventDefault(); addGift(); }));
  };
  $$('[data-f]').forEach(c => c.addEventListener('click', () => { state.filters[c.dataset.f] = c.dataset.v; $$(`[data-f="${c.dataset.f}"]`).forEach(x => x.setAttribute('aria-pressed', x === c)); draw(); }));
  draw();
  if (!state.thumbs && webgl) { let dead = false; disposers.push(() => dead = true);
    (scenesP ??= import('./three-scenes.js')).then(S => S.renderThumbs(PRODUCTS.filter(p => !p.gift))).then(th => { state.thumbs = th; if (!dead) draw(); }).catch(() => {}); }
}

/* ================= PRODUCT ================= */
function mountPDP() {
  let viewer = null;
  const getV = lazy3D($('.viewer .cv-wrap'), (S, cv) => { viewer = S.mountViewer(cv, { edition: state.edition, finish: state.finish, calm: state.calm }); if (state.edition === 'custom' && state.customImg) viewer.setEdition('custom', state.customImg); return viewer; });
  const V = () => getV?.() || viewer;
  const price = () => { $('#pPrice').innerHTML = egp(PRICE[state.edition]); $('#satc .p') && ($('#satc .p').innerHTML = egp(PRICE[state.edition] + (state.gift ? PRICE.gift : 0))); };
  const upl = () => {
    const box = $('#uploadBox');
    if (state.edition !== 'custom') { box.innerHTML = ''; return; }
    box.innerHTML = `<label class="upload" id="upl" for="fileIn"><span class="thumb">${state.customURL ? `<img src="${state.customURL}" alt="">` : ''}</span><span style="flex:1;min-width:0"><b style="font-weight:500;display:block">${t('upload_h')}</b><span style="font-size:14px;color:var(--muted)">${state.customURL ? t('upload_done') : t('upload_s')}</span></span><span class="btn sm">${I.up.replace('width="22" height="22"', 'width="16" height="16"')} ${t('upload_btn')}</span><input type="file" id="fileIn" accept="image/png,image/svg+xml,image/jpeg,image/webp" hidden></label>`;
    const handle = file => { if (!file) return; const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { state.customImg = img; state.customURL = fr.result; V()?.setEdition('custom', img); upl(); }; img.src = fr.result; }; fr.readAsDataURL(file); };
    $('#fileIn').addEventListener('change', e => handle(e.target.files[0]));
    const u = $('#upl'); ['dragenter', 'dragover'].forEach(ev => u.addEventListener(ev, e => { e.preventDefault(); u.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => u.addEventListener(ev, e => { e.preventDefault(); u.classList.remove('over'); if (ev === 'drop') handle(e.dataTransfer.files[0]); }));
  };
  $$('#edSeg button').forEach(b => b.addEventListener('click', () => { state.edition = b.dataset.ed; $$('#edSeg button').forEach(x => x.setAttribute('aria-pressed', x === b)); V()?.setEdition(state.edition, state.edition === 'custom' ? state.customImg : null); upl(); price(); }));
  $$('#finSw button').forEach(b => b.addEventListener('click', () => { state.finish = b.dataset.fin; $$('#finSw button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#finName').textContent = t(state.finish); V()?.setFinish(state.finish); }));
  $('#finName').textContent = t(state.finish);
  const sm = $('#selMake'), so = $('#selModel');
  const fillModels = () => { so.innerHTML = state.make === 'other' ? `<option value="request">${t('made_day')}</option>` : `<option value="">${t('choose')}</option>` + (MODELS[state.make] || []).map(m => `<option ${m === state.model ? 'selected' : ''}>${m}</option>`).join(''); so.disabled = !state.make; if (state.make === 'other') state.model = 'request'; };
  sm.value = state.make; fillModels();
  sm.addEventListener('change', () => { state.make = sm.value; state.model = ''; fillModels(); $('#fitOpt').style.outline = ''; });
  so.addEventListener('change', () => { state.model = so.value; $('#fitOpt').style.outline = ''; });
  $('#giftChk').addEventListener('click', e => { state.gift = !state.gift; e.currentTarget.setAttribute('aria-pressed', state.gift); price(); });
  const spinT = $('#spinT'); spinT.addEventListener('click', () => { const on = spinT.getAttribute('aria-pressed') !== 'true'; spinT.setAttribute('aria-pressed', on); $('#liveL').hidden = !on; V()?.setSpin(on); });
  const add = () => {
    if (!state.make || !state.model) { toast(t('need_fit')); const f = $('#fitOpt'); f.style.outline = '1px solid var(--blue)'; f.style.outlineOffset = '8px'; f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const thumb = state.edition === 'custom' && state.customURL ? state.customURL :state.thumbs?.[`cap-${state.edition}-${state.finish}`]?.[0] || 'img/boxcaps.jpg';
    addItem({ id: [state.edition, state.finish, state.make, state.model].join('|'), edition: state.edition, finish: state.finish, make: state.make, model: state.model, price: PRICE[state.edition], thumb });
    if (state.gift) addGift(true);
  };
  $('#atc').addEventListener('click', add);
  // mobile sticky add-to-cart
  const satc = $('#satc'); satc.innerHTML = `<div style="flex:1;min-width:0"><div class="label latin" style="font-size:10px">Floating Center Caps</div><div class="p"></div></div><button class="btn solid sm" style="height:46px">${t('add')}</button>`;
  satc.querySelector('button').addEventListener('click', add);
  const sio = new IntersectionObserver(([e]) => satc.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0), {}); sio.observe($('#atc'));
  disposers.push(() => { sio.disconnect(); satc.classList.remove('on'); });
  upl(); price();
}

/* ================= MADE / NEXT ================= */
function mountMade() {}
function mountNext() {
  let line = 'both';
  $$('[data-line]').forEach(b => b.addEventListener('click', () => { line = b.dataset.line; $$('[data-line]').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('#notifyForm').addEventListener('submit', e => {
    e.preventDefault(); const v = $('#nfContact').value.trim();
    const ok = /\S+@\S+\.\S+/.test(v) || /^[+\d\s-]{8,}$/.test(v);
    $('#nfMsg').innerHTML = ok ? `<div class="ok-msg"><span class="ok"></span>${t('notify_ok')}</div>` : `<p style="color:var(--blue)">${t('notify_err')}</p>`;
    if (ok) $('#nfContact').value = '';
  });
}

/* ================= CART ================= */
const cartCount = () => state.cart.reduce((n, i) => n + i.qty, 0);
function saveCart() { store.set('cart', state.cart.map(i => ({ ...i, thumb: i.thumb?.startsWith('data:') && i.thumb.length > 200000 ? 'img/boxcaps.jpg' : i.thumb }))); }
function addItem(it) {
  const ex = state.cart.find(i => i.id === it.id); ex ? ex.qty++ : state.cart.push({ ...it, qty: 1 });
  saveCart(); renderCart(); bumpCart(); openCart(); toast(t('added'));
}
function addGift(silent) { const ex = state.cart.find(i => i.id === 'gift'); if (!ex) state.cart.push({ id: 'gift', gift: true, price: PRICE.gift, qty: 1, thumb: 'img/box.jpg' }); saveCart(); renderCart(); bumpCart(); if (!silent) openCart(); }
function bumpCart() { const b = $('#cartBtn'); if (!b) return; b.querySelector('.count').textContent = cartCount(); b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin'); }
function renderCart() {
  const d = $('#drawer'); const sub = state.cart.reduce((s, i) => s + i.price * i.qty, 0); const hasGift = state.cart.some(i => i.gift);
  d.innerHTML = `<div class="ds"><i></i><i></i></div>
    <header><h2>${t('cart')} <span class="num" style="color:var(--muted)">(${cartCount()})</span></h2><button class="icon-btn" id="cartX" aria-label="${t('close')}">${I.x}</button></header>
    <div class="items" data-section="or-cart-drawer">
      ${state.cart.length ? state.cart.map((i, n) => `<div class="line"><img src="${i.thumb}" alt=""><div style="min-width:0">${i.gift ? `<b>${t('gift_box')}</b><span>${t('gift_box_s')}</span>` : `<b class="latin">Floating Center Caps</b><span class="latin">${capName(i.edition, i.finish)}</span><span>${i.make === 'other' ? t('made_day') : `<span class="latin">${MAKE_NAME[i.make]} ${i.model}</span>`} · ${t('set4')}</span>`}<span>× ${i.qty}</span><button class="rm" data-rm="${n}">${t('remove')}</button></div><span class="p">${egp(i.price * i.qty)}</span></div>`).join('')
        : `<div class="cart-empty"><p>${t('cart_empty')}</p><a class="btn sm" href="#floating-caps" data-close>${t('cta_shop')}</a></div>`}
      <div class="cod">${I.box}<p><b>${t('cod_h')}</b><span>${t('cod_s')}</span></p></div>
      ${!hasGift ? `<button class="check" id="giftUp"><span class="bx"></span><img src="img/box.jpg" alt=""><span class="t"><b>${t('gift_up')}</b><span>${t('gift_up_s')}</span></span>${egp(PRICE.gift)}</button>` : ''}
    </div>
    <footer><div class="tot"><span>${t('subtotal')}</span>${egp(sub)}</div><button class="btn solid block mag" id="checkout" ${state.cart.length ? '' : 'disabled style="opacity:.5"'}>${t('checkout')} ${ARR}</button><p class="fine">${t('checkout_note')} · ${t('to_checkout')}</p></footer>`;
  $('#cartX').addEventListener('click', closeCart);
  $$('[data-close]', d).forEach(a => a.addEventListener('click', closeCart));
  $$('[data-rm]', d).forEach(b => b.addEventListener('click', () => { state.cart.splice(+b.dataset.rm, 1); saveCart(); renderCart(); $('#cartBtn .count').textContent = cartCount(); }));
  $('#giftUp')?.addEventListener('click', () => addGift(true));
  $('#checkout').addEventListener('click', () => toast(t('to_checkout')));
  if (state.dev) d.classList.add('dev-on');
}
function openCart() { $('#drawer').classList.remove('on'); void $('#drawer').offsetWidth; $('#drawer').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); $('#scrim').classList.add('on'); lenis?.stop(); }
function closeCart() { $('#drawer').classList.remove('on'); $('#drawer').setAttribute('aria-hidden', 'true'); $('#scrim').classList.remove('on'); lenis?.start(); }
let toastT; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
function openMenu() { $('#mnav').classList.add('open'); $('#mnav').setAttribute('aria-hidden', 'false'); }
function closeMenu() { $('#mnav').classList.remove('open'); $('#mnav').setAttribute('aria-hidden', 'true'); }

/* ================= Shopify OS 2.0 handoff ================= */
const SCHEMA = {
  'or-hero-story': 'settings: eyebrow, heading (richtext, glowing last word), glow_word, subheading, cta_primary_label/link, cta_secondary_label, model_3d (file .glb), fallback_image (image_picker), calm_image · blocks: story_line {heading, subheading, stage 1–4}, part_label {part: plate|shell|bearing|weight, title, caption}',
  'or-editions': 'settings: heading, lead, model_3d · blocks (max 3): edition {name, caption, emblem_texture (image), product (product)}',
  'or-fitment': 'settings: heading, lead, whatsapp_number · blocks: make {name, models (text, comma list) | metaobject "fitment"} · output: deep-link to product with ?make&model',
  'or-customer-videos': 'settings: heading, lead · blocks: video {video (video), poster (image), car_label, edition} · plays on hover/tap, muted, 9:16',
  'or-craft-strip': 'blocks (4): step {image, title, caption} · settings: link_label, link (url)',
  'or-trust-bar': 'blocks: trust_item {icon: box|swap|shield|chat, title, caption}',
  'or-ride-kart-teaser': 'blocks: line {name, phase label, caption, silhouette image, link}',
  'or-gift-box': 'settings: image, heading, text, product (gift box product), occasions (text list)',
  'or-collection-header': 'settings: eyebrow, heading, lead, glow_word',
  'or-collection-grid': 'uses collection.products + Search & Discovery filters (make, edition, finish metafields) · card: 360 frames from product media / metafield thumbnails_360',
  'or-product-main': 'product form (standard Shopify) · variant options: Edition, Finish · line item properties: Make, Model, Custom design (file upload) · settings: model_3d, stock_threshold, gift_box_product, whatsapp_number',
  'or-product-specs': 'blocks: spec {label, value}',
  'or-faq': 'settings: heading · blocks: question {question, answer (richtext)}',
  'or-made-hero': 'settings: image, glow_word, eyebrow, heading, lead',
  'or-craft-steps': 'blocks: step {image|video, eyebrow, heading, text}',
  'or-heat-test': 'settings: heading, text · blocks: counter {value (number), unit, caption}',
  'or-video-feature': 'settings: video, poster, label, heading',
  'or-next-header': 'settings: eyebrow, heading, lead, glow_word',
  'or-silhouette-reveal': 'blocks: line {name, phase, caption, image}',
  'or-notify-signup': 'Shopify customer form (tags: notify-ride, notify-kart) + WhatsApp opt-in field',
  'or-support-header': 'settings: eyebrow, heading, lead, glow_word',
  'or-policy-cards': 'blocks: policy {icon, title, text}',
  'or-contact': 'settings: whatsapp, phone, address, email, hours',
  'or-cart-drawer': 'snippet: cart-drawer.liquid · settings: cod_message, gift_upsell_product · uses /cart/add.js, /cart/change.js',
  'or-footer': 'group: footer-group.json · settings: tagline, menus, contact, language selector (Shopify Markets: en, ar)',
};
const THEME_NOTES = [
  ['Templates (JSON, OS 2.0)', 'index.json · collection.json (OUTRUN Car) · product.floating-caps.json · page.made-here.json · page.coming-next.json · page.support.json · header-group.json · footer-group.json'],
  ['Assets', 'outrun.css (this stylesheet, tokens in :root) · outrun.js (this file, no framework) · outrun-3d.js (three-scenes.js, loaded with import() only when a 3D section is 300px from view) · three@0.160 from the Shopify CDN as a theme asset, not a third-party CDN · fonts: Chakra Petch + Changa via font_face filters'],
  ['Variants & properties', 'Product "Floating Center Caps": options Edition (Street/Signature/Custom) × Finish (Gloss Black/Satin Steel/Ice Chrome) = 9 variants. Make + Model as line item properties (validated in theme, listed in metaobject "fitment"). Custom design: Shopify file upload line item property. Gift box: separate product added via /cart/add.js (bundle in checkout).'],
  ['Metafields', 'product.outrun.stock_run (int), product.outrun.model_glb (file), product.outrun.emblem_street (image per make, merchant-licensed artwork), product.outrun.thumbs_360 (list of images rendered once at build), shop.outrun.whatsapp, shop.outrun.cod_message'],
  ['Markets & language', 'EN default, AR via Shopify Markets translation. dir=rtl set on <html> from request.locale. Brand lines stay Latin (translation keys marked keep_latin).'],
  ['Performance budget', 'LCP = hero fallback JPG (< 90 KB, preload, fetchpriority=high). 3D is lazy, DPR-capped at 1.5 on touch, paused off-screen and when the tab is hidden. One section sweep streak, GPU-composited (transform/opacity only). prefers-reduced-motion and the Calm switch disable 3D spin, streaks, sweeps and smooth scroll. Target: Lighthouse mobile ≥ 85, CLS 0 (every media box has aspect-ratio).'],
  ['Checkout', 'Standard Shopify checkout. Cash on delivery via Shopify Payments manual method; "Open before you pay" copy lives in checkout.liquid extensibility settings and the cart drawer section.'],
];
function renderDev() {
  const p = $('#devpanel'); p.hidden = !state.dev; document.body.classList.toggle('dev', state.dev); if (!state.dev) return;
  const secs = [...new Set($$('[data-section]').map(s => s.dataset.section))];
  p.innerHTML = `<h4>Shopify OS 2.0 · this template</h4><details style="margin-bottom:12px"><summary style="cursor:pointer;color:var(--blue);font-family:var(--f-display);font-size:11px;letter-spacing:.18em;text-transform:uppercase">Theme handoff notes</summary><dl style="margin-top:10px">${THEME_NOTES.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></details><p style="color:var(--muted);margin:0 0 12px">templates/${({ home: 'index', shop: 'collection', pdp: 'product', made: 'page.made-here', next: 'page.coming-next', support: 'page.support' })[route]}.json · <span class="ph">yellow outline = placeholder data</span></p><dl>${secs.map(s => `<div><dt>${s}.liquid</dt><dd>${SCHEMA[s] || ''}</dd></div>`).join('')}</dl>`;
}

/* ================= boot ================= */
function boot() {
  document.documentElement.lang = state.lang; document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('calm', state.calm);
  renderHeader(); renderFooter(); renderCart();
  startLenis();
  route = ROUTES[location.hash.slice(1)] || 'home'; render();
  addEventListener('hashchange', go);
  document.addEventListener('click', e => {
    const id = e.target.closest('button')?.id;
    if (id === 'langBtn' || id === 'langBtn2' || id === 'langBtn3') setLang(state.lang === 'en' ? 'ar' : 'en');
    if (id === 'cartBtn') openCart();
    if (id === 'menuBtn') openMenu();
    if (id === 'menuX') closeMenu();
    if (id === 'calmT') { state.calm = !state.calm; store.set('calm', state.calm); document.body.classList.toggle('calm', state.calm); state.calm ? stopLenis() : startLenis(); renderFooter(); render(true); }
    if (id === 'devT') { state.dev = !state.dev; renderFooter(); renderDev(); }
    if (e.target.closest('[data-goto-support]')) location.hash = 'support';
    const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href') === location.hash && a.getAttribute('href') !== '#') { closeMenu(); }
  });
  $('#scrim').addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeMenu(); } });
  const bar = $('#progress');
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}
boot();
