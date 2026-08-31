from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public' / 'guides' / 'guia-apuracao-resultados-cobudget.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
INK = HexColor('#132238')
MUTED = HexColor('#667085')
ORANGE = HexColor('#BD5B20')
TEAL = HexColor('#1F8279')
PAPER = HexColor('#F8F3EB')
SOFT = HexColor('#F5F7FA')

def wrap(text, font, size, width):
    words, lines, current = text.split(), [], ''
    for word in words:
        candidate = f'{current} {word}'.strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def paragraph(c, text, x, y, width, size=11, color=INK, leading=None):
    leading = leading or size * 1.52
    c.setFont('Helvetica', size)
    c.setFillColor(color)
    for line in wrap(text, 'Helvetica', size, width):
        c.drawString(x, y, line)
        y -= leading
    return y

def header(c, page, title='Guia de apuração de resultados'):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(42, PAGE_H - 34, 'COBUDGET')
    c.setFillColor(MUTED)
    c.setFont('Helvetica', 9)
    c.drawRightString(PAGE_W - 42, PAGE_H - 34, title)
    c.setStrokeColor(HexColor('#E8D9C9'))
    c.line(42, PAGE_H - 44, PAGE_W - 42, PAGE_H - 44)
    c.setFillColor(MUTED)
    c.setFont('Helvetica', 9)
    c.drawString(42, 27, 'cobudget.app')
    c.drawRightString(PAGE_W - 42, 27, str(page))

def card(c, x, y, w, h, title, body, accent=ORANGE):
    c.setFillColor(white)
    c.roundRect(x, y - h, w, h, 15, fill=1, stroke=0)
    c.setFillColor(accent)
    c.circle(x + 25, y - 26, 10, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(x + 46, y - 31, title)
    paragraph(c, body, x + 22, y - 62, w - 44, 10, MUTED)

def illustration(c, x, y, kind):
    w, h = 510, 185
    c.setFillColor(white)
    c.roundRect(x, y - h, w, h, 18, fill=1, stroke=0)
    if kind == 'competencia':
        c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 9); c.drawString(x + 24, y - 28, 'APURAÇÃO DE RESULTADOS')
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 21); c.drawString(x + 24, y - 56, 'Crie ou abra uma competência')
        for left, title, value in [(x+24,'COMPETÊNCIA','08/2026'), (x+215,'ESCOPO','DEFAULT')]:
            c.setFillColor(SOFT); c.roundRect(left, y-145, 165, 62, 10, fill=1, stroke=0)
            c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 8); c.drawString(left+14, y-104, title)
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 17); c.drawString(left+14, y-129, value)
        c.setFillColor(ORANGE); c.roundRect(x+398, y-132, 88, 36, 8, fill=1, stroke=0)
        c.setFillColor(white); c.setFont('Helvetica-Bold', 9); c.drawCentredString(x+442, y-110, 'ABRIR')
    elif kind == 'fontes':
        c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 9); c.drawString(x + 24, y - 28, 'REVISÃO ASSISTIDA')
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 21); c.drawString(x + 24, y - 56, 'Revise cada fonte')
        for top, name, label, color in [(y-83, 'REPASSE BP PAULISTA', 'Pronta para revisão', TEAL), (y-132, 'PROADI SUS BP', 'Exceções a resolver', ORANGE)]:
            c.setFillColor(SOFT); c.roundRect(x+24, top-37, 278, 39, 8, fill=1, stroke=0)
            c.setFillColor(color); c.circle(x+42, top-18, 6, fill=1, stroke=0)
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 9); c.drawString(x+55, top-15, name)
            c.setFillColor(MUTED); c.setFont('Helvetica', 8); c.drawRightString(x+287, top-15, label)
        c.setFillColor(SOFT); c.roundRect(x+329, y-160, 155, 78, 10, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 10); c.drawString(x+345, y-108, 'CONFIRMAR')
        c.setFont('Helvetica', 9); c.drawString(x+345, y-130, 'participantes')
        c.drawString(x+345, y-146, 'repetições e linhas')
    elif kind == 'regras':
        c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 9); c.drawString(x + 24, y - 28, 'REGRAS DO CÁLCULO')
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 21); c.drawString(x + 24, y - 56, 'Configure só o que se aplica')
        for left, title, body in [(x+24, 'Deduções por fonte', 'Opcional'), (x+270, 'Reservas e pontuação', 'Criadas por regra')]:
            c.setFillColor(SOFT); c.roundRect(left, y-145, 216, 63, 10, fill=1, stroke=0)
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 11); c.drawString(left+15, y-108, title)
            c.setFillColor(MUTED); c.setFont('Helvetica', 9); c.drawString(left+15, y-130, body)
        c.setStrokeColor(TEAL); c.setLineWidth(3); c.line(x+65, y-165, x+440, y-165)
        c.setFillColor(MUTED); c.setFont('Helvetica', 8); c.drawString(x+28, y-178, 'Bruta'); c.drawString(x+190, y-178, 'Deduções'); c.drawString(x+350, y-178, 'PL')
    else:
        c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 9); c.drawString(x + 24, y - 28, 'DECISÃO DA PRODUTIVIDADE')
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 21); c.drawString(x + 24, y - 56, 'Proposta preparada')
        c.setFillColor(HexColor('#FFF1E5')); c.roundRect(x+404, y-43, 79, 22, 11, fill=1, stroke=0)
        c.setFillColor(ORANGE); c.setFont('Helvetica-Bold', 8); c.drawCentredString(x+443, y-35, 'RASCUNHO')
        for left, title, value in [(x+24, 'PRODUTIVIDADE LÍQUIDA', 'R$ 82.805,99'), (x+270, 'VALOR A RECEBER', 'R$ 70.385,10')]:
            c.setFillColor(SOFT); c.roundRect(left, y-145, 215, 63, 10, fill=1, stroke=0)
            c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 8); c.drawString(left+14, y-105, title)
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 15); c.drawString(left+14, y-129, value)
        c.setFillColor(ORANGE); c.roundRect(x+272, y-178, 212, 27, 8, fill=1, stroke=0)
        c.setFillColor(white); c.setFont('Helvetica-Bold', 9); c.drawCentredString(x+378, y-161, 'ENVIAR PARA AUTORIZAÇÃO')

def page(c, page_no, title, intro, bullets, kind):
    header(c, page_no)
    c.setFillColor(ORANGE); c.setFont('Helvetica-Bold', 10); c.drawString(42, PAGE_H - 80, f'ETAPA {page_no - 1} DE 4')
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 25); c.drawString(42, PAGE_H - 112, title)
    y = paragraph(c, intro, 42, PAGE_H - 140, PAGE_W - 84, 12, MUTED)
    illustration(c, 42, y - 18, kind)
    y -= 225
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 14); c.drawString(42, y, 'O que fazer')
    y -= 25
    for bullet in bullets:
        c.setFillColor(TEAL); c.circle(49, y + 3, 3.5, fill=1, stroke=0)
        y = paragraph(c, bullet, 62, y, PAGE_W - 108, 11, INK) - 7
    c.showPage()

def build():
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle('Guia de apuração de resultados - CoBudget')
    c.setAuthor('CoBudget')
    c.setFillColor(PAPER); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(ORANGE); c.roundRect(42, PAGE_H - 132, 156, 30, 15, fill=1, stroke=0)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 10); c.drawCentredString(120, PAGE_H - 121, 'GUIA OPERACIONAL')
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 34); c.drawString(42, PAGE_H - 190, 'Apuração de resultados')
    c.drawString(42, PAGE_H - 232, 'da planilha à decisão')
    paragraph(c, 'Um roteiro visual para revisar fontes, aplicar somente regras explícitas e preparar decisões financeiras com rastreabilidade.', 42, PAGE_H - 278, 450, 15, MUTED)
    c.setFillColor(white); c.roundRect(42, 170, 511, 202, 24, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 17); c.drawString(70, 335, 'A jornada em uma visão')
    steps = ['Competência', 'Fontes', 'Regras', 'Decisão']
    for i, step in enumerate(steps):
        left = 77 + i * 113
        c.setFillColor(ORANGE if i < 3 else TEAL); c.circle(left, 275, 20, fill=1, stroke=0)
        c.setFillColor(white); c.setFont('Helvetica-Bold', 12); c.drawCentredString(left, 271, str(i+1))
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 11); c.drawCentredString(left, 233, step)
        if i < 3:
            c.setStrokeColor(HexColor('#D9A987')); c.setLineWidth(2); c.line(left+23, 275, left+88, 275)
    c.setFillColor(MUTED); c.setFont('Helvetica', 10); c.drawString(42, 46, 'cobudget.app/planning/financial-closings')
    c.showPage()
    page(c, 2, '1. Organize o período', 'Escolha o mês da apuração. A competência mantém fontes, regras, cálculos e decisões do período no mesmo contexto.', ['Abra uma competência existente quando quiser continuar ou corrigir o mesmo mês.', 'Crie outra competência apenas para outro período ou escopo.', 'Antes da decisão final, revisões legítimas podem gerar uma nova versão.'], 'competencia')
    page(c, 3, '2. Transforme a planilha em fontes revisadas', 'Envie o workbook, escolha o que representa fonte financeira e resolva somente as pendências encontradas.', ['Configure ou reutilize um perfil para cada tipo de planilha.', 'Associe participantes, preserve repetições legítimas e justifique exclusões.', 'Publicar inclui somente itens confirmados e não cria pagamento.'], 'fontes')
    page(c, 4, '3. Defina regras e calcule', 'O cálculo não usa taxa ou reserva implícita. Você cria as deduções, reservas e critérios que pertencem ao seu negócio.', ['Deduções de fonte incidem depois das reversões.', 'TM, TI e pontuação só aparecem quando uma regra explícita for criada.', 'Altere uma regra para criar nova revisão e recalcule antes de decidir.'], 'regras')
    page(c, 5, '4. Revise a proposta antes da autorização', 'A proposta reúne Valores a Receber do cálculo atual. Rascunho é revisável; autorização só ocorre quando os participantes, valores e vencimentos estiverem corretos.', ['Confirme cobertura das entradas publicadas.', 'Use o rascunho para voltar às regras ou fontes sem emitir obrigação.', 'Trate Margem em uma decisão independente da Produtividade.'], 'decisao')
    header(c, 6, 'Checklist final')
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 26); c.drawString(42, PAGE_H - 88, 'Checklist antes de autorizar')
    checklist = ['As fontes necessárias foram incluídas e revisadas.', 'Participantes, repetições e linhas inválidas receberam decisão explícita.', 'As regras refletem o negócio e não há taxa implícita.', 'O resultado e a memória foram conferidos.', 'A cobertura foi confirmada.', 'A proposta continua em rascunho até a revisão final.']
    y = PAGE_H - 140
    for item in checklist:
        c.setStrokeColor(TEAL); c.setLineWidth(2); c.roundRect(46, y-10, 16, 16, 3, fill=0, stroke=1)
        y = paragraph(c, item, 80, y, PAGE_W-130, 13, INK) - 18
    c.setFillColor(ORANGE); c.roundRect(42, 122, 255, 44, 12, fill=1, stroke=0)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 13); c.drawCentredString(169, 139, 'ABRIR APURAÇÃO DE RESULTADOS')
    c.setFillColor(MUTED); c.setFont('Helvetica', 10); c.drawString(42, 89, 'Acesse cobudget.app/planning/financial-closings')
    c.showPage()
    c.save()

if __name__ == '__main__':
    build()
