#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a apresentacao Pitch_Gama.pptx a partir do conteudo do Modelo_Pitch.pdf,
reproduzindo o visual do deck original (Canva) e inserindo as imagens novas
da demonstracao (fotos em alta definicao e QR code).

Dependencias (gratuitas):
    pip install python-pptx Pillow

Uso:
    python3 gerar_pitch_pptx.py

Saida:
    Pitch_Gama.pptx  (16:9, 18 slides)

Assets usados (extraidos do deck Canva original e da demo):
    pptx-assets/   logos TJCE/UFC/GAMA, padrao hexagonal, foto do problema
    fotos-slides/  capturas em alta definicao da demonstracao
    qr-demo.png    QR code da demo publicada
"""

import os
from io import BytesIO

from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

# --------------------------------------------------------------------------
# Configuracao geral
# --------------------------------------------------------------------------

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "pptx-assets")
FOTOS = os.path.join(BASE, "fotos-slides")
GERADOS = os.path.join(ASSETS, "gerados")  # fundos e imagens preparados
os.makedirs(GERADOS, exist_ok=True)

SAIDA = os.path.join(BASE, "Pitch_Gama.pptx")

# Paleta do deck Canva (amostrada nas paginas exportadas)
AZUL = RGBColor(0x01, 0x2E, 0x63)
VERDE = RGBColor(0x77, 0xB2, 0x55)
BRANCO = RGBColor(0xFF, 0xFF, 0xFF)
AZUL_TEXTO = RGBColor(0x01, 0x2E, 0x63)
CINZA = RGBColor(0x44, 0x44, 0x44)

TUP_AZUL = (0x01, 0x2E, 0x63)
TUP_VERDE = (0x77, 0xB2, 0x55)

FONTE = "Poppins"  # fonte do deck original (fallback: sans-serif)

LARGURA = Inches(13.333)
ALTURA = Inches(7.5)


# --------------------------------------------------------------------------
# Fundos compostos (cor solida + padrao hexagonal) via Pillow
# --------------------------------------------------------------------------

def gerar_padrao_hexagonal(cor_linha, alfa, nome, raio=90, espessura=2, ponto=5):
    """Desenha o padrao de hexagonos com pontos nos vertices (como no deck
    original, onde o padrao e vetorial e nao uma imagem)."""
    import math
    saida = os.path.join(GERADOS, nome)
    if os.path.exists(saida):
        return saida
    w, h = 1920, 1080
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    dx = math.sqrt(3) * raio
    dy = 1.5 * raio
    linha = cor_linha + (alfa,)
    for row in range(-2, int(h / dy) + 3):
        for col in range(-2, int(w / dx) + 3):
            cx = col * dx + (dx / 2 if row % 2 else 0)
            cy = row * dy
            pontos = []
            for k in range(6):
                ang = math.radians(60 * k - 90)  # vertice superior primeiro
                pontos.append((cx + raio * math.cos(ang),
                               cy + raio * math.sin(ang)))
            d.polygon(pontos, outline=linha, width=espessura)
            for px, py in pontos:
                d.ellipse([px - ponto, py - ponto, px + ponto, py + ponto],
                          fill=linha)
    img.save(saida)
    return saida


def montar_fundo(cor_rgb, cor_padrao, alfa, nome, raio=90):
    """Cria 1920x1080: cor solida + padrao hexagonal desenhado por cima."""
    saida = os.path.join(GERADOS, nome)
    if os.path.exists(saida):
        return saida
    padrao = gerar_padrao_hexagonal(cor_padrao, alfa, nome + "-padrao.png", raio)
    base = Image.new("RGBA", (1920, 1080), cor_rgb + (255,))
    base.alpha_composite(Image.open(padrao))
    base.convert("RGB").save(saida, quality=95)
    return saida


def preparar_assets():
    """Prepara fundos, logos recolorados e fotos para o PowerPoint."""
    fundos = {
        "azul": montar_fundo(TUP_AZUL, (46, 96, 156), 130, "bg-azul.jpg"),
        "verde": montar_fundo(TUP_VERDE, (74, 124, 52), 150, "bg-verde.jpg"),
        "branco": montar_fundo((255, 255, 255), (156, 196, 136), 140, "bg-branco.jpg"),
    }

    # GAMA branco para a capa: azul marinho vira branco, folha verde mantida
    gama_branco = os.path.join(GERADOS, "gama-branco.png")
    if not os.path.exists(gama_branco):
        img = Image.open(os.path.join(ASSETS, "logo2-b.png")).convert("RGBA")
        pixels = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = pixels[x, y]
                if a > 0 and r + g + b < 330:  # tons escuros (azul) -> branco
                    pixels[x, y] = (255, 255, 255, a)
        img.save(gama_branco)

    # Fotos das telas em 1920x1200 (leveza + qualidade para projetor)
    telas = {}
    for chave, arquivo in [
        ("demo", "alta-definicao-1-demonstracao-completa.png"),
        ("triagem", "alta-definicao-2-triagem-dados-complementares.png"),
        ("resultado", "alta-definicao-3-resultado-semforo.png"),
        ("relatorio", "alta-definicao-4-relatorio-analise.png"),
    ]:
        origem = os.path.join(FOTOS, arquivo)
        destino = os.path.join(GERADOS, f"tela-{chave}.jpg")
        if not os.path.exists(destino):
            img = Image.open(origem).convert("RGB")
            img.thumbnail((1920, 1200), Image.LANCZOS)
            img.save(destino, quality=88)
        telas[chave] = destino

    # Foto do problema recortada em hexagono (mesmo estilo do deck Canva)
    foto_hex = os.path.join(GERADOS, "foto-problema-hexagono.png")
    if not os.path.exists(foto_hex):
        img = Image.open(os.path.join(ASSETS, "foto-prob-000.jpg")).convert("RGBA")
        # Recorta para quadrado central antes de mascarar
        lado = min(img.size)
        img = img.crop(((img.width - lado) // 2, 0,
                        (img.width + lado) // 2, lado)).resize((900, 900), Image.LANCZOS)
        mascara = Image.new("L", (900, 900), 0)
        # Hexagono vertical (pontas em cima e embaixo), como no deck original
        poligono = [(450, 0), (900, 225), (900, 675), (450, 900), (0, 675), (0, 225)]
        ImageDraw.Draw(mascara).polygon(poligono, fill=255)
        img.putalpha(mascara)
        img.save(foto_hex)

    return fundos, gama_branco, telas, foto_hex


# --------------------------------------------------------------------------
# Helpers de slide
# --------------------------------------------------------------------------

def fundo(slide, caminho):
    """Imagem de fundo cobrindo a pagina inteira."""
    slide.shapes.add_picture(caminho, 0, 0, width=LARGURA, height=ALTURA)


def caixa(slide, l, t, w, h, texto, tam=18, cor=BRANCO, negrito=False,
          centralizado=False, sublinhado=False, fonte=FONTE, entrelinha=1.1):
    """Caixa de texto simples com uma unica linha."""
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER if centralizado else PP_ALIGN.LEFT
    p.line_spacing = entrelinha
    run = p.add_run()
    run.text = texto
    run.font.size = Pt(tam)
    run.font.bold = negrito
    run.font.underline = sublinhado
    run.font.color.rgb = cor
    run.font.name = fonte
    return tb


def lista(slide, l, t, w, h, itens, tam=18, cor=BRANCO, marcador="\u2022  ",
          espaco=8, entrelinha=1.15, negrito_prefixo=False):
    """Lista com marcador; itens podem ser str ou (prefixo, resto)."""
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    for i, item in enumerate(itens):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(espaco)
        p.line_spacing = entrelinha
        if isinstance(item, tuple):
            r1 = p.add_run()
            r1.text = marcador + item[0]
            r1.font.size = Pt(tam)
            r1.font.bold = True
            r1.font.color.rgb = cor
            r1.font.name = FONTE
            r2 = p.add_run()
            r2.text = item[1]
            r2.font.size = Pt(tam)
            r2.font.color.rgb = cor
            r2.font.name = FONTE
        else:
            r = p.add_run()
            r.text = marcador + item
            r.font.size = Pt(tam)
            r.font.bold = negrito_prefixo
            r.font.color.rgb = cor
            r.font.name = FONTE
    return tb


def retangulo(slide, l, t, w, h, cor, contorno=None, raio=True):
    """Retangulo (arredondado por padrao) sem sombra."""
    forma = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if raio else MSO_SHAPE.RECTANGLE, l, t, w, h)
    forma.fill.solid()
    forma.fill.fore_color.rgb = cor
    if contorno is None:
        forma.line.fill.background()
    else:
        forma.line.color.rgb = contorno
        forma.line.width = Pt(1)
    forma.shadow.inherit = False  # remove a sombra herdada do tema
    return forma


def cabecalho(slide, fundo_path, secao=None, logo_gama=None, logo_tjce=None,
              logo_ufc=None, cor_texto=BRANCO, logo_central=None):
    """Faixa superior: Hackathon (esq), logo GAMA (centro), Equipe (dir)."""
    fundo(slide, fundo_path)
    caixa(slide, Inches(0.5), Inches(0.22), Inches(4.2), Inches(0.4),
          "Hackathon TJCE + UFC", tam=14, cor=cor_texto, negrito=True)
    caixa(slide, Inches(9.4), Inches(0.22), Inches(3.4), Inches(0.4),
          "Equipe 11 - D1", tam=14, cor=cor_texto, negrito=True, centralizado=True)
    if logo_central:
        slide.shapes.add_picture(logo_central, Inches(5.9), Inches(0.14),
                                 height=Inches(0.55))
    if secao:
        # Rótulo de secao: encolhe a fonte se for longo para nao quebrar
        tam_rotulo = 20 if len(secao) <= 45 else 16
        rotulo = caixa(slide, Inches(0.5), Inches(0.82), Inches(12.3), Inches(0.5),
                       secao, tam=tam_rotulo, cor=cor_texto, negrito=True,
                       sublinhado=True)
        rotulo.name = "rotulo-secao"


def nova_pagina(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])  # layout em branco


# --------------------------------------------------------------------------
# Montagem dos slides (conteudo do Modelo_Pitch.pdf)
# --------------------------------------------------------------------------

def construir():
    fundos, gama_branco, telas, foto_hex = preparar_assets()

    logo_gama_cor = os.path.join(ASSETS, "logo2-b.png")
    logo_tjce_br = os.path.join(ASSETS, "logo1-a.png")
    logo_ufc_br = os.path.join(ASSETS, "logo1-b.png")
    logo_tjce_cor = os.path.join(ASSETS, "logo2-a.png")
    logo_ufc_cor = os.path.join(ASSETS, "logo2-c.png")
    qr = os.path.join(BASE, "qr-demo.png")

    prs = Presentation()
    prs.slide_width = LARGURA
    prs.slide_height = ALTURA

    # ---------------------------------------------------------------- capa
    s = nova_pagina(prs)
    fundo(s, fundos["azul"])
    s.shapes.add_picture(logo_tjce_br, Inches(0.55), Inches(0.4), height=Inches(0.62))
    s.shapes.add_picture(logo_ufc_br, Inches(2.3), Inches(0.4), height=Inches(0.62))
    caixa(s, Inches(9.2), Inches(0.4), Inches(3.6), Inches(0.8),
          "Hackathon TJCE + UFC\nEquipe 11 - D1", tam=15, cor=BRANCO,
          negrito=True, centralizado=True)
    s.shapes.add_picture(gama_branco, Inches(2.9), Inches(2.0), width=Inches(7.5))
    caixa(s, Inches(1.2), Inches(5.9), Inches(10.9), Inches(1.0),
          "Conectando a dignidade humana e a preservação ambiental "
          "em cada decisão", tam=24, cor=VERDE, centralizado=True)

    # -------------------------------------------------- problema | desafio 01
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="PROBLEMA | DESAFIO 01",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    caixa(s, Inches(0.6), Inches(1.9), Inches(6.6), Inches(4.6),
          "Como tratar as ações envolvendo ocupações irregulares em áreas "
          "de preservação ambiental, considerando os limites financeiros, "
          "territoriais e sociais dos municípios, bem como a dignidade e a "
          "vida das pessoas envolvidas?", tam=27, cor=AZUL_TEXTO, entrelinha=1.25)
    s.shapes.add_picture(foto_hex, Inches(8.1), Inches(1.55), height=Inches(5.4))

    # ------------------------------------------------------------ problema
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="PROBLEMA",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    caixa(s, Inches(0.8), Inches(1.7), Inches(11.7), Inches(1.3),
          "Ceará tem mais de 445,4 mil pessoas vivendo em unidades de "
          "conservação, 8ª maior população do Brasil",
          tam=30, cor=AZUL_TEXTO, negrito=True, centralizado=True, entrelinha=1.2)
    caixa(s, Inches(0.8), Inches(3.15), Inches(11.7), Inches(0.4),
          "Diário do Nordeste - 11 de julho de 2025",
          tam=14, cor=AZUL_TEXTO, centralizado=True)
    lista(s, Inches(1.6), Inches(3.9), Inches(10.1), Inches(3.2), [
        "O tempo de solução da sentença é demorado e desgastante para todos os lados.",
        "O meio ambiente segue se degradando ao longo do tempo de resolução.",
        "Pessoas ficam em situação de vulnerabilidade social, sem para onde ir.",
        "O município não tem recursos suficientes para lidar com a situação.",
    ], tam=18, cor=AZUL_TEXTO, espaco=10)

    # --------------------------------------------------------------- balança
    s = nova_pagina(prs)
    fundo(s, fundos["verde"])
    caixa(s, Inches(1.5), Inches(3.0), Inches(10.3), Inches(1.6),
          "Como manter a balança equilibrada?", tam=44, cor=AZUL_TEXTO,
          negrito=True, centralizado=True)

    # -------------------------------------------------------- nossa solucao
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="NOSSA SOLUÇÃO", logo_central=logo_gama_cor)
    itens = [
        "Análise de processos com triagem guiada",
        "Semáforo de risco em três eixos: geotécnico, social e ambiental",
        "Geração de relatório de análise anonimizado em um clique",
        "Alternativas viáveis e minuta de decisão pronta para edição",
    ]
    for i, texto in enumerate(itens):
        t = Inches(1.7 + i * 1.3)
        retangulo(s, Inches(1.6), t, Inches(10.1), Inches(1.05), BRANCO)
        caixa(s, Inches(2.0), t + Inches(0.24), Inches(9.3), Inches(0.7),
              texto, tam=21, cor=AZUL_TEXTO, negrito=True, centralizado=True)

    # ------------------------------------------------- validacao: vema
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"],
              secao="VALIDAÇÃO | PERGUNTAMOS À VEMA, E ELES RESPONDERAM",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    caixa(s, Inches(0.6), Inches(1.45), Inches(12.1), Inches(0.5),
          "Durante o desafio, a equipe enviou 14 perguntas à equipe da VEMA. "
          "As respostas moldaram a solução:", tam=16, cor=AZUL_TEXTO)
    linhas = [
        ("Como é a triagem hoje?", "Fila de redistribuição; não há critérios específicos de análise"),
        ("Qual o maior gargalo?", "Identificar a fase do processo (acervo vem de outras unidades) e garantir celeridade"),
        ("O que é verificado primeiro?", "Existência de pedido de tutela de urgência"),
        ("Existe relatório de análise?", "Não. Só despachos, decisões e sentenças"),
        ("Quais fontes são consultadas?", "CF/88 art. 225, CPC, Código Florestal, Leis 7.347/1985 e 9.605/1998"),
        ("Dá para exportar dados?", "Sim. E há restrições de segurança a considerar"),
    ]
    # Grade manual de cards (mais controlavel que a tabela nativa)
    alt_linha = Inches(0.62)
    for i, (pergunta, resposta) in enumerate(linhas):
        t = Inches(2.15) + i * alt_linha
        cor_card = BRANCO if i % 2 == 0 else RGBColor(0xEC, 0xF4, 0xE4)
        retangulo(s, Inches(0.6), t, Inches(4.4), Inches(0.56), cor_card, raio=False)
        retangulo(s, Inches(5.05), t, Inches(7.65), Inches(0.56), cor_card, raio=False)
        caixa(s, Inches(0.75), t + Inches(0.11), Inches(4.1), Inches(0.4),
              pergunta, tam=13, cor=AZUL_TEXTO, negrito=True)
        caixa(s, Inches(5.2), t + Inches(0.05), Inches(7.35), Inches(0.5),
              resposta, tam=12, cor=AZUL_TEXTO, entrelinha=1.0)
    retangulo(s, Inches(0.6), Inches(6.05), Inches(12.1), Inches(1.1), BRANCO)
    tb = s.shapes.add_textbox(Inches(0.85), Inches(6.18), Inches(11.6), Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.line_spacing = 1.1
    r1 = p.add_run()
    r1.text = "Resposta à dúvida da reunião de 28/09 (Bárbara): "
    r1.font.size = Pt(13)
    r1.font.bold = True
    r1.font.color.rgb = AZUL_TEXTO
    r1.font.name = FONTE
    r2 = p.add_run()
    r2.text = ("confirmado - existem sentenças além das de desocupação, na área "
               "cível e na criminal: anulação de multas, obrigações de fazer e "
               "não fazer e ações criminais. O GAMA já classifica esses tipos "
               "de demanda na triagem.")
    r2.font.size = Pt(13)
    r2.font.color.rgb = AZUL_TEXTO
    r2.font.name = FONTE

    # ------------------------------------------------- validacao: matriz
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="VALIDAÇÃO | MATRIZ DE DECISÃO",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    caixa(s, Inches(0.6), Inches(1.5), Inches(12.1), Inches(0.6),
          "O semáforo de risco: cada cor aponta o caminho jurídico mais adequado.",
          tam=22, cor=AZUL_TEXTO, negrito=True)
    cores = [
        (RGBColor(0xD9, 0x3B, 0x2B), "Vermelho", "Risco à vida", "Desocupação assistida urgente"),
        (RGBColor(0xE8, 0xA8, 0x2C), "Amarelo", "Risco mitigável", "Suspensão e saneamento / TAC"),
        (RGBColor(0x2E, 0xA8, 0x6B), "Verde", "Consolidado", "Permanência condicionada / ReurbS"),
    ]
    for i, (cor, nome, diag, caminho) in enumerate(cores):
        t = Inches(2.4 + i * 1.35)
        retangulo(s, Inches(1.0), t, Inches(1.0), Inches(1.05), cor)
        retangulo(s, Inches(2.3), t, Inches(10.0), Inches(1.05), BRANCO)
        caixa(s, Inches(2.7), t + Inches(0.16), Inches(9.2), Inches(0.4),
              f"{nome}: {diag} - {caminho}", tam=19, cor=AZUL_TEXTO, negrito=True)
    caixa(s, Inches(0.6), Inches(6.55), Inches(12.1), Inches(0.7),
          "Critério determinístico e explicável: qualquer marcação no eixo "
          "Geotécnico/Vida resulta em vermelho; na ausência dele, marcações no "
          "eixo Social resultam em amarelo; no Ambiental, verde.",
          tam=13, cor=AZUL_TEXTO, centralizado=True, entrelinha=1.1)

    # ------------------------------------------- na tela: telas 1 e 2
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="NA TELA", logo_central=logo_gama_cor)
    for i, (chave, legenda) in enumerate([
        ("demo", "1. Menu inicial e documento lado a lado"),
        ("triagem", "2. Triagem com dados complementares da VEMA"),
    ]):
        l = Inches(0.55 + i * 6.45)
        retangulo(s, l - Inches(0.08), Inches(1.62), Inches(6.35), Inches(4.35),
                  BRANCO, raio=False)
        s.shapes.add_picture(telas[chave], l, Inches(1.7), width=Inches(6.2))
        caixa(s, l, Inches(6.0), Inches(6.2), Inches(0.6),
              legenda, tam=15, cor=BRANCO, centralizado=True)

    # ------------------------------------------- na tela: relatorio (destaque)
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="NA TELA | RELATÓRIO DE ANÁLISE",
              logo_central=logo_gama_cor)
    for i, (chave, legenda) in enumerate([
        ("resultado", "3. Semáforo, nota de urgência e fundamentação"),
        ("relatorio", "4. Relatório anonimizado - imprimir/PDF ou JSON"),
    ]):
        l = Inches(0.55 + i * 6.45)
        retangulo(s, l - Inches(0.08), Inches(1.62), Inches(6.35), Inches(4.35),
                  BRANCO, raio=False)
        s.shapes.add_picture(telas[chave], l, Inches(1.7), width=Inches(6.2))
        caixa(s, l, Inches(6.0), Inches(6.2), Inches(0.6),
              legenda, tam=15, cor=BRANCO, centralizado=True)
    caixa(s, Inches(0.55), Inches(6.7), Inches(12.2), Inches(0.5),
          "A VEMA não produz relatório de análise hoje. O GAMA gera esse "
          "relatório, anonimizado, em um clique.", tam=16, cor=VERDE,
          negrito=True, centralizado=True)

    # ------------------------------------------------- integracao segura
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"],
              secao="INTEGRAÇÃO SEGURA | RESPONDENDO ÀS RESTRIÇÕES DA VEMA",
              logo_central=logo_gama_cor)
    caixa(s, Inches(0.6), Inches(1.5), Inches(12.1), Inches(0.6),
          "A VEMA confirmou que existem restrições de segurança e que a "
          "plataforma permite importar e exportar informações.",
          tam=17, cor=BRANCO)
    lista(s, Inches(1.0), Inches(2.5), Inches(11.3), Inches(4.3), [
        ("A extensão roda no lado do usuário, ", "ao lado da plataforma já usada - não exige API nem alteração nos sistemas do TJCE."),
        ("Nada sai da máquina: ", "triagem, anotações e relatório ficam no localStorage do dispositivo, sem servidor e sem nuvem."),
        ("Exportação por arquivo (JSON/PDF), ", "exatamente o formato que a plataforma já permite importar e exportar."),
        ("Complementar por design: ", "não substitui a plataforma - soma a ela."),
    ], tam=19, cor=BRANCO, espaco=16, entrelinha=1.2)

    # -------------------------------------------------------------- onu
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="ALINHAMENTO COM A AGENDA DA ONU",
              logo_central=logo_gama_cor)
    for i, (num, texto) in enumerate([
        ("11", "Cidades e Comunidades Sustentáveis"),
        ("16", "Paz, Justiça e Instituições Eficazes"),
    ]):
        l = Inches(1.4 + i * 6.0)
        retangulo(s, l, Inches(2.3), Inches(4.9), Inches(3.6), BRANCO)
        caixa(s, l, Inches(2.7), Inches(4.9), Inches(1.3),
              num, tam=72, cor=VERDE, negrito=True, centralizado=True)
        caixa(s, l + Inches(0.4), Inches(4.3), Inches(4.1), Inches(1.4),
              texto, tam=22, cor=AZUL_TEXTO, negrito=True, centralizado=True)

    # ------------------------------------------------------------ impacto
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="IMPACTO",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    for i, texto in enumerate([
        "Apoiar decisões que protejam o meio ambiente.",
        "Garantir a dignidade das pessoas envolvidas.",
        "Facilitar análises e tomadas de decisão.",
        "Reduzir o prazo de resolução das demandas.",
    ]):
        t = Inches(1.9 + i * 1.25)
        retangulo(s, Inches(1.6), t, Inches(10.1), Inches(1.0), BRANCO)
        caixa(s, Inches(2.0), t + Inches(0.22), Inches(9.3), Inches(0.6),
              texto, tam=21, cor=AZUL_TEXTO, negrito=True, centralizado=True)

    # --------------------------------------------------- modelo de negocio
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="MODELO DE NEGÓCIO",
              logo_central=logo_gama_cor)
    lista(s, Inches(1.4), Inches(2.3), Inches(10.5), Inches(4.0), [
        ("B2G: ", "adoção institucional pelo TJCE."),
        ("Valor: ", "baixo custo - roda como extensão sobre a estrutura já existente (PJe, AURI, Sara)."),
        ("Zero: ", "contratações de servidores e custos de licenciamento."),
    ], tam=22, cor=BRANCO, espaco=22, entrelinha=1.25)

    # ------------------------------------------------------ diferenciais
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="NOSSOS DIFERENCIAIS",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    lista(s, Inches(1.1), Inches(1.8), Inches(11.1), Inches(5.2), [
        ("Foco: ", "ocupações irregulares em Áreas de Preservação Permanente (APP) no TJCE."),
        ("Proteção de famílias vulneráveis ", "e freio no avanço dos danos ambientais durante a tramitação."),
        ("Checklist estruturado + matriz de decisão ", "em três eixos: geotécnico, social e ambiental."),
        ("Relatório de análise anonimizado ", "- o documento que a VEMA confirmou não existir hoje, gerado em um clique (PDF e JSON)."),
        ("Solução 100% gratuita e offline: ", "HTML, CSS e JavaScript puros, zero dependências."),
    ], tam=18, cor=AZUL_TEXTO, espaco=14, entrelinha=1.2)

    # ----------------------------------------------------- proximos passos
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="PRÓXIMOS PASSOS DO NEGÓCIO",
              logo_central=logo_gama_cor)
    etapas = [
        ("30 dias", "Finalização da extensão web"),
        ("3 meses", "Parceria institucional e piloto (PoC) na VEMA"),
        ("6 meses", "Ajustes de integração ao sistema do TJCE (PJe)"),
        ("9-12 meses", "Implementação de IA para leitura de peças e sugestão de caminhos jurídicos"),
    ]
    for i, (prazo, texto) in enumerate(etapas):
        t = Inches(1.8 + i * 1.15)
        retangulo(s, Inches(1.3), t, Inches(2.6), Inches(0.95), VERDE)
        retangulo(s, Inches(4.0), t, Inches(8.0), Inches(0.95), BRANCO)
        caixa(s, Inches(1.3), t + Inches(0.24), Inches(2.6), Inches(0.5),
              prazo, tam=19, cor=BRANCO, negrito=True, centralizado=True)
        caixa(s, Inches(4.3), t + Inches(0.14), Inches(7.4), Inches(0.7),
              texto, tam=15, cor=AZUL_TEXTO, entrelinha=1.05)
    caixa(s, Inches(1.3), Inches(6.6), Inches(10.7), Inches(0.5),
          "Prazos propostos pelo projeto, a definir em acordo de cooperação "
          "técnica com o TJCE.", tam=12, cor=BRANCO, centralizado=True)

    # ---------------------------------------------------------------- time
    s = nova_pagina(prs)
    cabecalho(s, fundos["verde"], secao="O TIME",
              logo_central=logo_gama_cor, cor_texto=AZUL_TEXTO)
    time = [
        ("Carla Nayanna", "Mestranda em Avaliação de Políticas Públicas, Assistente Social, Especialista em Políticas Públicas (UFC Campus PICI)."),
        ("Josias Batista", "Engenheiro de Software (UFC Campus Quixadá). 1º Lugar no Corredores Digitais Bora Criar 2026; 3º Lugar - Trilha Web 3.0 no hackathon XRP Ledger (XRPL) 2024."),
        ("Inês Lima", "Engenharia de Computação (UFC Campus Sobral)."),
    ]
    for i, (nome, bio) in enumerate(time):
        t = Inches(1.8 + i * 1.75)
        retangulo(s, Inches(1.3), t, Inches(10.7), Inches(1.55), BRANCO)
        tb = s.shapes.add_textbox(Inches(1.7), t + Inches(0.18), Inches(10.0), Inches(1.25))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.line_spacing = 1.1
        r1 = p.add_run()
        r1.text = nome + " - "
        r1.font.size = Pt(18)
        r1.font.bold = True
        r1.font.color.rgb = AZUL_TEXTO
        r1.font.name = FONTE
        r2 = p.add_run()
        r2.text = bio
        r2.font.size = Pt(15)
        r2.font.color.rgb = AZUL_TEXTO
        r2.font.name = FONTE

    # ------------------------------------------------------- demonstracao
    s = nova_pagina(prs)
    cabecalho(s, fundos["azul"], secao="DEMONSTRE AO VIVO",
              logo_central=logo_gama_cor)
    caixa(s, Inches(0.8), Inches(1.7), Inches(7.6), Inches(0.9),
          "insli.github.io/GAMA_Assistente", tam=26, cor=VERDE,
          negrito=True, centralizado=True)
    lista(s, Inches(0.9), Inches(2.9), Inches(7.4), Inches(3.5), [
        "Demonstração completa sem instalar nada.",
        "Vídeo da demonstração (plano B): inserir o link do vídeo gravado.",
        "Roteiro de 2 a 3 minutos no arquivo Roteiro_Demo.md.",
    ], tam=17, cor=BRANCO, espaco=14)
    retangulo(s, Inches(9.1), Inches(2.0), Inches(3.4), Inches(3.9), BRANCO)
    s.shapes.add_picture(qr, Inches(9.45), Inches(2.3), height=Inches(2.7))
    caixa(s, Inches(9.2), Inches(5.15), Inches(3.2), Inches(0.6),
          "Aponte a câmera e\nabra a demonstração", tam=13, cor=AZUL_TEXTO,
          centralizado=True)

    # -------------------------------------------------------- encerramento
    s = nova_pagina(prs)
    fundo(s, fundos["branco"])
    s.shapes.add_picture(logo_gama_cor, Inches(5.55), Inches(0.5), height=Inches(0.9))
    caixa(s, Inches(1.5), Inches(2.4), Inches(10.3), Inches(1.5),
          "Porque, diante de um conflito ambiental, proteger o território e "
          "respeitar a dignidade humana precisam fazer parte da mesma busca "
          "por soluções.", tam=23, cor=AZUL_TEXTO, centralizado=True,
          entrelinha=1.25)
    caixa(s, Inches(1.5), Inches(4.3), Inches(10.3), Inches(1.4),
          "OBRIGADO(A)!", tam=66, cor=VERDE, negrito=True, centralizado=True)
    s.shapes.add_picture(logo_ufc_cor, Inches(4.15), Inches(6.3), height=Inches(0.75))
    s.shapes.add_picture(logo_tjce_cor, Inches(8.3), Inches(6.3), height=Inches(0.75))

    prs.save(SAIDA)
    print(f"Apresentacao gerada: {SAIDA}")
    print(f"Slides: {len(prs.slides.__iter__.__self__._sldIdLst)}")


if __name__ == "__main__":
    construir()
