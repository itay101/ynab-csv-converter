import enum

from files_processors.isracard_processor import IsracardProcessor
from files_processors.max_processor import MaxProcessor
from files_processors.mizrahi_processor import MizrahiProcessor
from files_processors.poalim_processor import PoalimProcessor


class AccountTypes(enum.Enum):
    ISRACARD = "isracard"
    MAX = "max"
    MIZRAHI = "mizrahi"
    POALIM = "poalim"


class AccountTypeToProcessor:
    def __init__(self):
        self._account_type_to_processor = {
            AccountTypes.ISRACARD.value: IsracardProcessor,
            AccountTypes.MAX.value: MaxProcessor,
            AccountTypes.MIZRAHI.value: MizrahiProcessor,
            AccountTypes.POALIM.value: PoalimProcessor,
        }

    def get_processor_by_type(self, account_type):
        return self._account_type_to_processor.get(account_type)
