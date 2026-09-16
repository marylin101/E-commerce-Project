async function loadPartial(url, placeholderId) {
    const res = await fetch(url);
    const html  = await res.text();
    document.getElementById(placeholderId).innerHTML = html;
};

loadPartial('../partials/header.html', 'header-placeholder');
loadPartial('../partials/footer.html', 'footer-placeholder')

const filtPlaceholder = document.getElementById('filt-nav-placeholder');
if(filtPlaceholder){
    loadPartial('../partials/navigation.html', 'filt-nav-placeholder').then(()=> {
    const navCont = document.getElementById('categoryNav');
    if(navCont){
        navCont.addEventListener('click', (event)=>{
            const clickbtn = event.target.closest('.nav-item');

            if(!clickbtn){
                return;
            }

            navCont.querySelectorAll('.nav-item').forEach(btn => {
                btn.classList.remove('active');
            });

            clickbtn.classList.add('active');
            //this adds filter to the navigation remove if not needed
            const selectCat = clickbtn.dataset.category;
            filterProducts(selectCat);
        });
    }
    
});
}

