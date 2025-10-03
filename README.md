# Theme Override: localStorage.theme

Força `localStorage.theme` da página para `dark` quando ligado e para `custom-winter` quando desligado, com um popup para alternar.

## Como usar no Chrome/Edge (Windows)

1. Abra o navegador (Chrome, Edge, Brave etc.).
2. Acesse a página de extensões:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Ative o modo Desenvolvedor (Developer Mode) no canto superior direito.
4. Clique em "Carregar sem compactação" (Load unpacked) e selecione a pasta `d:\\wplace-darktheme`.
5. Fixe o ícone da extensão na barra. Ao clicar, use o interruptor para ligar/desligar:
   - Ligado: define `localStorage.theme = 'dark'`
   - Desligado: define `localStorage.theme = 'custom-winter'`

A extensão reaplica o valor ao mudar/atualizar de aba.

## Escopo de sites (opcional)
Por padrão, a extensão tem permissão para `<all_urls>`. Para limitar, edite `manifest.json` em `host_permissions` e coloque apenas os domínios desejados, por exemplo:

```json
"host_permissions": [
  "https://wplace.live/*"
]
```

## Como funciona
- Um service worker (`background.js`) injeta um pequeno código na página ativa para definir `localStorage.theme` e dispara eventos para que a UI do site reaja.
- O popup salva o estado em `chrome.storage.local` e envia a ação ao background.

## Observações
- Não funciona em páginas internas como `chrome://*` ou `edge://*`.
- Se o site sobrescrever o `localStorage.theme` depois do carregamento, você pode alternar o switch para forçar a reescrita.

---
Criado para alternar rapidamente entre temas "dark" e "custom-winter" via `localStorage`.
