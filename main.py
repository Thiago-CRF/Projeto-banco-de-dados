import database
import consultas
from consultas import Produto
from os import name, system

def limpar_tela():
    if name == "nt":
        system("cls")
    else:
        system("clear")

def pausar():
    input("\n# Pressione ENTER para continuar... #\n")

limpar_tela()

database.criar_banco()
adm = consultas.Gerente()
# Criar uma opção para cada opção da classe gerente
while True:    
    print("\nPainel de gerenciamento da lanchonete")    
    print("-"*30)

    print("1 - Cadastrar novo produto \n2 - Atualizar produto existente \n3 - Remover produto" \
    "\n4 - Listar todos os produtos \n5 - Pesquisar produto por nome \n0 - Sair")
    print("-"*30)

    escolha = input("Escolha uma opção: ")
    match escolha:
        # inserir produto
        case "1":
            limpar_tela()
            print("\n--## Cadastro de produto ##--")

            nome = input("\nNome do produto a ser inserido: \n")
            while nome == "":
                nome = input("## Nome invalido digitado, digite novamente: \n")

            desc = input("\nDescrição do produto (opcional, Enter se não deseja): \n")
            if desc == "":
                desc = None
            else:
                print("")

            preco = input("Preço do produto a ser inserido: \n")
            while preco == "":
                preco = input("## Preço invalido digitado, digite novamente: \n")
            preco = float(preco)

            produto_ins = Produto(nome, desc, preco)

            adm.inserir_prod(produto_ins)
            pausar()
            limpar_tela()

        # atualizar produto
        case "2":
            limpar_tela()
            print("\n--## Atualização de produto ##--")

            produtos = adm.listar_todos()
            if not produtos:
                print("Não há produtos cadastrados para atualizar")

                pausar()
                limpar_tela()
                continue

            prod_id = input("Digite o ID do produto para ser atualizado (0 para cancelar): \n")
            prod_id = int(prod_id)

            ids_validos = [0]
            for i in produtos:
                ids_validos.append(i[0])

            while prod_id not in ids_validos:
                prod_id = input("\nID de produto invalido, digite novamente (0 para cancelar): \n")
                prod_id = int(prod_id)

            if prod_id == 0:
                pausar()
                limpar_tela()
                continue

            for i in produtos:
                if i[0] == prod_id:
                    nome_ant = i[1]
                    desc_ant = i[2]
                    preco_ant = i[3]

            nome = input("\nDigite o novo nome do produto (Enter se não deseja mudar): \n")
            if nome == "":
                nome = nome_ant

            desc = input("\nDigite a nova descrição do produto (Enter se não deseja mudar): \n")
            if desc == "":
                desc = desc_ant

            preco = input("\nDigite o novo preço do produto (Enter se não deseja mudar): \n")
            if preco == "":
                preco = preco_ant
            preco = float(preco)

            produto_att = Produto(nome, desc, preco)

            adm.atualizar_prod(prod_id, produto_att)
            pausar()
            limpar_tela()

        # remover produto
        case "3":
            limpar_tela()
            print("\n--## Remoção de produto ##--")

            produtos = adm.listar_todos()
            if not produtos:
                print("Não há produtos cadastrados para remover")

                pausar()
                limpar_tela()
                continue

            prod_id = input("\nDigite o ID do produto para ser removido (0 para cancelar): \n")
            prod_id = int(prod_id)

            ids_validos = [0]
            for i in produtos:
                ids_validos.append(i[0])

            while prod_id not in ids_validos:
                prod_id = input("ID de produto invalido, digite novamente (0 para cancelar): \n")
                prod_id = int(prod_id)

            if prod_id == 0:
                pausar()
                limpar_tela()
                continue

            adm.remover_prod(prod_id)
            pausar()
            limpar_tela()
            
        # listar todos
        case "4":
            limpar_tela()
            print("\n--## Lista de produtos cadastrados ##--")

            produtos = adm.listar_todos()
            if not produtos:
                print("Não há produtos cadastrados no sistema.")

                pausar()
                limpar_tela()
                continue

            pausar()
            limpar_tela()
            
        # pesquisar produto por nome
        case "5":
            limpar_tela()
            print("\n--## Pesquisar produtos por nome ##--")

            pesquisa = input("\nDigite um nome para pesquisa: \n")

            resultados = adm.pesquisar_prod_por_nome(pesquisa)

            if not resultados:
                print("Nenhum produto registrado com esse nome\n")

                pausar()
                limpar_tela()
                continue

            print(f"\n--# Resultados da busca: '{pesquisa}' #--")

            # transformar esse bloco de print produtos em um função pra usar aqui e em qualquer lugar
            # que liste os produtos
            print("\n| ID | Nome | Preço(R$) | Quantidade vendida | Descrição")
            print("-"*80)
            
            for i in resultados:
                print(f"- ID {i[0]} | {i[1]} | R$ {i[3]} | {i[4]} |")

                if i[2] == None:
                    print("")
                else:
                    print(f"{i[2]}\n")

            print("-"*80)
            pausar()
            limpar_tela()

        case "0":
            print("\n# Fechando sistema #")
            adm.fechar_conexao()
            break

        case _:
            limpar_tela()
            print("## Opção inválida digitada. Digite uma opção válida ##")



# relatório geral de vendas
