# Roteiro de demonstração | GAMA Assistente

Roteiro de **2 a 3 minutos** para o dia do pitch. Objetivo: percorrer o
fluxo completo sem travar e terminar com o relatório na tela.

## Antes do evento (checklist)

- [ ] Publicar o repositório no GitHub Pages (já publicado em
      `https://insli.github.io/GAMA_Assistente/`).
- [ ] Testar a demo no navegador que será usado na apresentação.
- [ ] **Gravar o vídeo de fallback** (plano B): gravar a tela executando
      este mesmo roteiro e guardar o arquivo local. Se a internet ou o
      navegador falhar, o vídeo roda sem depender de nada.
- [ ] Carregar a extensão no Chrome (`chrome://extensions` →
      Modo do desenvolvedor → Carregar extensão sem compactação →
      pasta `Hackathon_TJCE_GAMA/Assistent`), caso use a extensão ao vivo.
- [ ] Ter o QR code (`qr-demo.png`) no slide final.

## Roteiro (passo a passo)

### 1. Abertura | o problema (30 s)

- Mostrar o slide do problema: 445,4 mil pessoas em unidades de
  conservação no Ceará.
- Frase de efeito: *"Enquanto o processo tramita, o meio ambiente degrada e
  a família permanece na vulnerabilidade. E a VEMA nos disse que nem
  relatório de análise é produzido hoje."*

### 2. A triagem guiada (45 s)

1. Abrir `demonstracao.html` (documento à esquerda, painel à direita).
2. Clicar em **Iniciar Nova Triagem**.
3. Preencher os **dados complementares**:
   - Marcar **"Há pedido de tutela de urgência?"** (destaque amarelo) -
     dizer: *"é o primeiro item que a VEMA verifica na triagem"*.
   - Selecionar a fase (**Instrução**) e o tipo de demanda.
4. Selecionar um trecho do documento à esquerda, escolher o **eixo** na
   caixinha e definir o **nível de risco** no painel (4 ou 5).
5. Concluir: *"o servidor marca os eixos em vez de decorar critérios."*

### 3. O semáforo de risco (30 s)

- Clicar em **Processar Matriz de Risco**.
- Destacar o diagnóstico (vermelho/amarelo/verde), a ação sugerida e a
  **nota de tutela de urgência**.
- Frase: *"cada cor aponta o caminho jurídico mais adequado - e o
  critério é determinístico e explicável ao jurado."*

### 4. O relatório anonimizado | momento forte (45 s)

- Rolar até **Relatório de Análise**.
- Clicar em **Imprimir / Salvar PDF** e mostrar o documento gerado com o
  número **mascarado** (`XXXXXXX-XX.XXXX.8.06.0001`).
- Frase: *"a VEMA não produz relatório de análise. O GAMA gera esse
  relatório, anonimizado, em um clique - em PDF ou JSON."*
- Opcional: clicar em **Baixar JSON** para mostrar a exportação.

### 5. Fechamento (30 s)

- Voltar ao slide de integração: *"roda ao lado da plataforma, sem API,
  sem servidor e sem dados saindo do computador do servidor - por design,
  compatível com as restrições de segurança que a VEMA confirmou."*
- Mostrar o QR code e encerrar com a frase de impacto.

## Gravação do vídeo de fallback (plano B)

1. Usar o gravador de tela do próprio sistema
   (`Ctrl+Shift+Alt+R` no GNOME ou `Ctrl+Shift+R` no Chrome) ou
   OBS Studio (gratuito).
2. Executar o roteiro acima em ritmo calmo, sem áudio (ou com áudio -
   a decisão é da equipe).
3. Salvar em MP4 e guardar no repositório ou em pen drive.
4. No dia: se a demo ao vivo falhar, reproduzir o vídeo e seguir
   apresentando por cima.

## Dicas de segurança no dia

- Nunca depender de internet para a demonstração principal: a demo é
  estática e pode ser aberta localmente (`demonstracao.html`).
- Se o painel lateral não abrir na extensão, o GAMA já cai para uma aba
  nova automaticamente (reserva implementada no `background.js`).
- Terminar sempre no relatório: é o diferencial que ninguém mais tem.
