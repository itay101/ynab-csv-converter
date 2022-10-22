from files_processors.isracard_processor import IsracardProcessor
from files_processors.max_processor import MaxProcessor
from files_processors.poalim_processor import PoalimProcessor


FILES = [
    PoalimProcessor(file_path="example.csv", export_file_path="example.csv"),
    IsracardProcessor(file_path="example.xls", export_file_path="example.csv"),
    MaxProcessor(file_path="example.xlsx", export_file_path="example.csv")
]


def process_files():
    for file in FILES:
        file.write_csv_file()


if __name__ == '__main__':
    process_files()
