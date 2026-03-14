function comprarItem(){

    let estoque= 10;
if(estoque>0){


 let comprado= "Item comprado";
 document.getElementById("comprar").textContent = comprado;
comprado.style.color = "green";   
} else if (estoque <= 0){

    let semEstoque= "Sem estoque";
    document.getElementById("comprar").textContent = semEstoque;
    semEstoque.style.color = "red";


}



}