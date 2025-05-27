// components/SelectionConfigurator.tsx
"use client";

import React, { useState } from "react";
// Importar os componentes Button e Input (opcional para display de quantidade) do shadcn/ui
import { Button } from "@eugenios/ui/components/button"; // Ajuste o caminho
// Importar icons se quiser usar botões +/- com ícones
import { Category, Product } from "@eugenios/types";
import { useCartStore } from "@/store/cartStore";
import { CartProduct } from "@/store/cartStore"; // Ajuste o caminho para o tipo CartProduct
import { Typography } from "@eugenios/ui/src/components/ui/Typography";

interface SelectionConfiguratorProps {
  categoryData: Category; // Usar o tipo correto para a configuração de seleção
}

// Definir o tipo para o estado que guarda as quantidades
interface SelectedQuantities {
  [optionId: string]: number;
}

const SelectionConfigurator: React.FC<SelectionConfiguratorProps> = ({ categoryData }) => {
  // O estado agora guarda um objeto onde a chave é o ID da opção e o valor é a quantidade
  const [selectedQuantities, setSelectedQuantities] = useState<SelectedQuantities>({});

  const addToCart = useCartStore((state) => state.addToCart);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);

  // Função para lidar com a mudança de quantidade de uma opção específica
  const handleQuantityChange = (optionId: string, delta: number) => {
    setSelectedQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[optionId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta); // Garante que a quantidade não é negativa

      // Se a nova quantidade for 0, podemos remover a opção do estado para limpar, ou manter com 0
      // Manter com 0 é mais simples para o display, remover limpa o objeto de estado
      if (newQuantity === 0) {
        // Remove a opção se a quantidade for 0
        const { [optionId]: _, ...rest } = prevQuantities;
        return rest;
      } else {
        // Adiciona ou atualiza a quantidade
        // Se for uma seleção única e uma nova opção for selecionada (>0), resetar outras
        return { ...prevQuantities, [optionId]: newQuantity };
      }
    });
  };

  // Função para "selecionar" ou "desselecionar" uma opção clicando no box
  // Ao clicar, definimos a quantidade para 1 (se for 0) ou 0 (se for > 0)
  const handleOptionClick = (optionId: string) => {
    setSelectedQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[optionId] || 0;

      if (currentQuantity > 0) {
        // Se já selecionado (quantidade > 0), clica para desselecionar (quantidade 0)
        const { [optionId]: _, ...rest } = prevQuantities;
        return rest; // Remove do estado
        // return { ...prevQuantities, [optionId]: 0 }; // Ou apenas seta para 0
      } else {
        // Se não selecionado (quantidade 0), clica para selecionar (quantidade 1)
        // Se múltiplas seleções permitidas, adiciona esta com quantidade 1
        return { ...prevQuantities, [optionId]: 1 };
      }
    });
  };

  const calculateTotal = () => {
    // Itera sobre as opções disponíveis e soma o preço * quantidade para as selecionadas
    // Se não houver produtos, retorna 0
    if (!categoryData.products || categoryData.products.length === 0) {
      return 0;
    }
    return categoryData.products.reduce((sum, product) => {
      const quantity = selectedQuantities[product.id] || 0; // Obtém a quantidade (0 se não selecionada)
      return sum + product.price * quantity;
    }, 0);
  };
  const handleAddToCart = () => {
    // Cria a lista de itens para adicionar ao carrinho, incluindo a quantidade
    const selectedItems = Object.keys(selectedQuantities)
      .filter((optionId) => (selectedQuantities[optionId] || 0) > 0) // Filtra apenas as opções com quantidade > 0
      .map((optionId) => {
        const product = categoryData.products?.find((prod) => prod.id === optionId);
        if (!product) return null; // Deve ser encontrado, mas safety check

        return product;
      })
      .filter((product): product is Product => product !== null); // Remove any nulls and type assertion

    if (selectedItems.length === 0) {
      alert("Por favor, selecione pelo menos uma opção.");
      return;
    } // Add each selected product to cart individually
    selectedItems.forEach((product) => {
      const cartProduct: CartProduct = {
        ...product,
        quantity: selectedQuantities[product.id] || 0,
      };

      addToCart(cartProduct);
      setTimeout(() => {
        setIsCartOpen(true);
        setSelectedQuantities({});
      }, 500);
    });
  };

  const isOptionSelected = (optionId: string) => (selectedQuantities[optionId] || 0) > 0;
  const getOptionQuantity = (optionId: string) => selectedQuantities[optionId] || 0;

  return (
    <div className="bg-slate-100 p-6 rounded-lg mb-6">
      {categoryData.helpDescription && <p className="font-medium mb-4">{categoryData.helpDescription}</p>}
      {categoryData.products && categoryData.products?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {categoryData.products.map((product) => {
              const quantity = getOptionQuantity(product.id);
              const selected = isOptionSelected(product.id);

              return (
                <div key={product.id} className="space-y-4">
                  <div
                    className={`p-4 border rounded-lg bg-white hover:border-primary ring-primary hover:ring-2 transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                    onClick={() => (!selected ? handleOptionClick(product.id) : handleOptionClick(product.id))}
                  >
                    <div className="flex flex-col">
                      <Typography as="a" variant="body" className="font-medium">
                        {product.name}
                      </Typography>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <p className="text-sm text-muted-foreground">Duração: {product.duration}</p>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>
                        </div>
                        {selected && (
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-l-md rounded-r-none"
                              onClick={(e) => {
                                e.stopPropagation(); // Impede que o click propague para a div pai (evitando desselecionar)
                                handleQuantityChange(product.id, -1);
                              }}
                              disabled={quantity <= 1} // Desabilita o botão '-' se a quantidade for 1
                            >
                              <span className="sr-only">Diminuir</span>
                              <span className="text-lg">−</span>
                            </Button>
                            <div className="h-9 px-3 flex items-center justify-center border-y">
                              <span className="w-5 text-center">{quantity}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-r-md rounded-l-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(product.id, +1);
                              }}
                            >
                              <span className="sr-only">Aumentar</span>
                              <span className="text-lg">+</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total:</p>
              <p className="text-xl font-bold">{calculateTotal().toFixed(2)} €</p>
            </div>{" "}
            <Button
              onClick={handleAddToCart}
              disabled={Object.keys(selectedQuantities).every((id) => (selectedQuantities[id] || 0) <= 0)}
              className="w-fit text-center rounded-full px-6 py-3 text-white  focus:outline-none"
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
};

export default SelectionConfigurator;
