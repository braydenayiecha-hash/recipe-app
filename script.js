const RECIPES = [
  { name: "Tomato Egg Fried Rice", time: 15, diet: ["vegetarian"], needs: ["rice","eggs","tomatoes"], steps: ["Scramble eggs, set aside","Sauté tomatoes 3 min","Add cold rice + soy sauce, fry 5 min","Mix eggs back in"] },
  { name: "Veggie Omelette", time: 10, diet: ["vegetarian","high-protein"], needs: ["eggs","onions","tomatoes"], steps: ["Beat eggs with salt","Sauté onions + tomatoes","Pour eggs, cook 4 min, fold"] },
  { name: "Garlic Butter Pasta", time: 20, diet: ["vegetarian"], needs: ["pasta","garlic","butter"], steps: ["Boil pasta","Melt butter + garlic","Toss pasta + parmesan if you have"] },
  { name: "Bean Stew", time: 30, diet: ["vegan","vegetarian"], needs: ["beans","onions","tomatoes"], steps: ["Sauté onions","Add tomatoes + beans + water","Simmer 20 min + spices"] },
  { name: "Chicken Stir Fry", time: 25, diet: ["high-protein"], needs: ["chicken","rice","garlic"], steps: ["Cook rice","Stir-fry chicken strips","Add garlic + soy + veggies"] },
  { name: "Avocado Toast + Eggs", time: 10, diet: ["vegetarian","high-protein"], needs: ["bread","avocado","eggs"], steps: ["Toast bread","Mash avocado with salt/lemon","Top with fried egg"] },
  { name: "Peanut Noodles", time: 15, diet: ["vegan","vegetarian"], needs: ["noodles","peanut butter","garlic"], steps: ["Cook noodles","Mix peanut butter + soy + hot water","Toss noodles in sauce"] },
  { name: "Chapati + Bean Curry", time: 30, diet: ["vegan","vegetarian"], needs: ["flour","beans","onions"], steps: ["Make chapati dough + cook","Cook onions + beans + curry powder","Serve together"] },
  { name: "Tuna Rice Bowl", time: 10, diet: ["high-protein"], needs: ["tuna","rice","eggs"], steps: ["Warm rice","Top with tuna + boiled egg + soy sauce"] },
  { name: "Banana Pancakes", time: 15, diet: ["vegetarian"], needs: ["banana","flour","eggs"], steps: ["Mash banana + eggs + flour","Fry small pancakes 2 min/side"] },
  { name: "Potato Hash", time: 25, diet: ["vegan","vegetarian"], needs: ["potatoes","onions","garlic"], steps: ["Dice potatoes","Fry with onions 15 min","Add garlic + spices"] },
  { name: "Sukuma + Ugali", time: 25, diet: ["vegan","vegetarian"], needs: ["sukuma wiki","maize flour","onions"], steps: ["Boil water + add flour, stir firm","Sauté sukuma with onions","Serve hot"] },
];

let myIngredients = [];

const $ = id => document.getElementById(id);
const input = $("ingredientInput"), tagsEl = $("tags"), resultsEl = $("results");

function renderTags(){
  tagsEl.innerHTML = myIngredients.map((ing,i) =>
    `<div class="tag">${ing}<span data-i="${i}"> ✕</span></div>`
  ).join('');
  tagsEl.querySelectorAll('span').forEach(s =>
    s.onclick = () => { myIngredients.splice(+s.dataset.i,1); renderTags(); });
}

function addIngredients(text){
  text.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).forEach(ing=>{
    if(!myIngredients.includes(ing)) myIngredients.push(ing);
  });
  renderTags();
}

$("addBtn").onclick = () => { addIngredients(input.value); input.value=''; };
input.onkeydown = e => { if(e.key==='Enter'){ addIngredients(input.value); input.value=''; } };
$("clearBtn").onclick = () => { myIngredients=[]; renderTags(); resultsEl.innerHTML=''; $("shoppingCard").classList.add('hidden'); };

$("surpriseBtn").onclick = () => {
  const r = RECIPES[Math.floor(Math.random()*RECIPES.length)];
  showRecipes([{...r, have: [], missing: r.needs, score: 0}]);
};

$("generateBtn").onclick = () => {
  const diet = $("diet").value, maxTime = +$("time").value;
  if(myIngredients.length===0){ alert("Add at least 1 ingredient first!"); return; }

  let scored = RECIPES.map(r=>{
    const have = r.needs.filter(n=>myIngredients.some(m=>m.includes(n)||n.includes(m)));
    const missing = r.needs.filter(n=>!have.includes(n));
    return {...r, have, missing, score: have.length / r.needs.length };
  }).filter(r => (diet==='any' || r.diet.includes(diet)) && r.time <= maxTime)
    .sort((a,b)=>b.score-a.score).slice(0,3);

  if(!scored.length){ resultsEl.innerHTML = `<div class="recipe">No match. Try "Any diet" or add more ingredients.</div>`; return; }
  showRecipes(scored);
};

function showRecipes(list){
  resultsEl.innerHTML = list.map(r=>{
    const pct = Math.round(r.score*100);
    return `<div class="recipe">
      <div class="match">${pct}% match • ${r.time} min</div>
      <h3>${r.name}</h3>
      <div class="meta">${r.diet.join(' • ')}</div>
      <p><span class="have">✅ You have: ${r.have.join(', ')||'—'}</span><br>
      <span class="need">❌ Missing: ${r.missing.join(', ')||'nothing!'}</span></p>
      <ol>${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
      <button onclick="addShopping('${r.name}')">Add missing to shopping list</button>
    </div>`;
  }).join('');
  window._last = list;
}

window.addShopping = (name) => {
  const r = window._last.find(x=>x.name===name);
  $("shoppingCard").classList.remove('hidden');
  $("shoppingList").innerHTML = r.missing.map(m=>`<li><input type="checkbox"> ${m}</li>`).join('') || '<li>Nothing needed! 🎉</li>';
};